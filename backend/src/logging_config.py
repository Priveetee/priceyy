import json
import logging
import uuid
from datetime import datetime
from pythonjsonlogger import jsonlogger

class JSONFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(JSONFormatter, self).add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        if hasattr(record, 'correlation_id'):
            log_record['correlation_id'] = record.correlation_id

def setup_logging():
    json_handler = logging.StreamHandler()
    json_handler.setFormatter(JSONFormatter())
    
    root_logger = logging.getLogger()
    root_logger.addHandler(json_handler)
    root_logger.setLevel(logging.INFO)
    
    return root_logger

class CorrelationIdFilter(logging.Filter):
    def filter(self, record):
        record.correlation_id = getattr(record, 'correlation_id', None)
        return True
