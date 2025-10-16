from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from src.enums import Provider, PricingModel

class PricingBase(BaseModel):
    provider: Provider
    service_name: str
    resource_type: str
    region: str
    pricing_model: PricingModel
    hourly_price: float = Field(gt=0, decimal_places=6)
    yearly_commitment_discount: Optional[float] = Field(None, ge=0, le=1)
    currency: str = "EUR"
    source: Optional[str] = None

class PricingCreate(PricingBase):
    pass

class PricingResponse(PricingBase):
    id: UUID
    last_updated: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class EstimationServiceBase(BaseModel):
    service_name: str
    region: str
    quantity: int = Field(gt=0, le=10000)
    monthly_cost: float = Field(ge=0)
    annual_cost: float = Field(ge=0)
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
    name: str = Field(min_length=1, max_length=255)
    provider: Provider
    notes: Optional[str] = Field(None, max_length=1000)

class EstimationCreate(EstimationBase):
    user_id: Optional[str] = Field(None, max_length=255)
    data: dict
    services: List[EstimationServiceCreate]

class EstimationResponse(EstimationBase):
    id: UUID
    user_id: Optional[str]
    status: str
    total_monthly_cost: float = Field(ge=0)
    total_annual_cost: float = Field(ge=0)
    created_at: datetime
    updated_at: datetime
    services: List[EstimationServiceResponse]
    
    class Config:
        from_attributes = True

class ServiceConfig(BaseModel):
    service: str
    resource_type: str
    quantity: int = Field(gt=0, le=10000)
    region: str
    pricing_model: PricingModel
    hours_per_month: int = Field(default=730, gt=0, le=8760)

class CalculationRequest(BaseModel):
    provider: Provider
    services: List[ServiceConfig] = Field(min_items=1)
    session_id: Optional[str] = Field(None, max_length=255)

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

class CalculationResponse(BaseModel):
    total_monthly_cost: float
    total_annual_cost: float
    services_breakdown: List[ServiceCostCalculation]

class UserPriceOverrideCreate(BaseModel):
    session_id: str = Field(min_length=1, max_length=255)
    pricing_id: UUID
    custom_hourly_price: float = Field(gt=0, decimal_places=6)
    reason: Optional[str] = Field(None, max_length=500)

class UserPriceOverrideResponse(UserPriceOverrideCreate):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
