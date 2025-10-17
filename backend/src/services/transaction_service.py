from sqlalchemy.orm import Session
import logging
import json
from typing import Callable, Any, List, Tuple

logger = logging.getLogger(__name__)

class TransactionStep:
    def __init__(self, name: str, action: Callable, rollback: Callable):
        self.name = name
        self.action = action
        self.rollback = rollback
        self.executed = False
        self.result = None

class SagaTransaction:
    def __init__(self, name: str, db: Session):
        self.name = name
        self.db = db
        self.steps: List[TransactionStep] = []
        self.executed_steps: List[TransactionStep] = []
    
    def add_step(self, name: str, action: Callable, rollback: Callable):
        step = TransactionStep(name, action, rollback)
        self.steps.append(step)
        return self
    
    async def execute(self) -> Tuple[bool, Any]:
        try:
            for step in self.steps:
                try:
                    result = await step.action(self.db) if hasattr(step.action, '__await__') else step.action(self.db)
                    step.result = result
                    step.executed = True
                    self.executed_steps.append(step)
                    
                    logger.info(json.dumps({
                        "event": "saga.step.success",
                        "saga": self.name,
                        "step": step.name
                    }))
                except Exception as e:
                    logger.error(json.dumps({
                        "event": "saga.step.failed",
                        "saga": self.name,
                        "step": step.name,
                        "error": str(e)
                    }))
                    
                    await self._rollback_all()
                    self.db.rollback()
                    
                    return False, str(e)
            
            self.db.commit()
            
            logger.info(json.dumps({
                "event": "saga.completed",
                "saga": self.name,
                "steps_count": len(self.executed_steps)
            }))
            
            return True, self.executed_steps[-1].result if self.executed_steps else None
            
        except Exception as e:
            logger.critical(json.dumps({
                "event": "saga.critical_error",
                "saga": self.name,
                "error": str(e)
            }))
            await self._rollback_all()
            self.db.rollback()
            return False, str(e)
    
    async def _rollback_all(self):
        for step in reversed(self.executed_steps):
            try:
                await step.rollback(self.db) if hasattr(step.rollback, '__await__') else step.rollback(self.db)
                
                logger.info(json.dumps({
                    "event": "saga.step.rollback_success",
                    "saga": self.name,
                    "step": step.name
                }))
            except Exception as e:
                logger.error(json.dumps({
                    "event": "saga.step.rollback_failed",
                    "saga": self.name,
                    "step": step.name,
                    "error": str(e)
                }))
