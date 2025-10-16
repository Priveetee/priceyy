from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class PricingBase(BaseModel):
    provider: str
    service_name: str
    resource_type: str
    region: str
    pricing_model: str
    hourly_price: float
    yearly_commitment_discount: Optional[float] = None
    currency: str = 'EUR'
    source: Optional[str] = None

class PricingCreate(PricingBase):
    pass

class PricingResponse(PricingBase):
    id: UUID
    last_updated: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class PricingHistoryResponse(BaseModel):
    id: UUID
    pricing_id: UUID
    old_hourly_price: Optional[float]
    new_hourly_price: Optional[float]
    change_reason: str
    changed_at: datetime
    
    class Config:
        from_attributes = True

class EstimationServiceBase(BaseModel):
    service_name: str
    region: str
    quantity: int
    monthly_cost: float
    annual_cost: float
    parameters: dict

class EstimationServiceCreate(EstimationServiceBase):
    pass

class EstimationServiceResponse(EstimationServiceBase):
    id: UUID
    estimation_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class EstimationBase(BaseModel):
    name: str
    provider: str
    notes: Optional[str] = None

class EstimationCreate(EstimationBase):
    user_id: Optional[str] = None
    data: dict
    services: List[EstimationServiceCreate]

class EstimationResponse(EstimationBase):
    id: UUID
    user_id: Optional[str]
    status: str
    total_monthly_cost: float
    total_annual_cost: float
    created_at: datetime
    updated_at: datetime
    services: List[EstimationServiceResponse]
    
    class Config:
        from_attributes = True

class UserPriceOverrideCreate(BaseModel):
    session_id: str
    pricing_id: UUID
    custom_hourly_price: float
    reason: Optional[str] = None

class UserPriceOverrideResponse(UserPriceOverrideCreate):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class PricingProposalCreate(BaseModel):
    pricing_id: UUID
    proposed_hourly_price: float
    rationale: str
    user_id: Optional[str] = None

class PricingProposalResponse(PricingProposalCreate):
    id: UUID
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    
    class Config:
        from_attributes = True

class ServiceCostCalculation(BaseModel):
    service: str
    resource_type: str
    quantity: int
    region: str
    pricing_model: str
    base_hourly_price: float
    final_hourly_price: float
    monthly_cost: float
    annual_cost: float

class CalculationRequest(BaseModel):
    provider: str
    services: List[dict]
    session_id: Optional[str] = None

class CalculationResponse(BaseModel):
    total_monthly_cost: float
    total_annual_cost: float
    services_breakdown: List[ServiceCostCalculation]
