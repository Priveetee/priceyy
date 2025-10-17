from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict
from enum import Enum
from uuid import UUID
from datetime import datetime

class PricingModelEnum(str, Enum):
    ON_DEMAND = "on-demand"
    RESERVED_1Y = "reserved-1y"
    RESERVED_3Y = "reserved-3y"
    SPOT = "spot"

class ProviderEnum(str, Enum):
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"

class ServiceConfig(BaseModel):
    service: str
    resource_type: str
    quantity: int
    region: str
    pricing_model: PricingModelEnum
    hours_per_month: int = 730

class DataTransferConfig(BaseModel):
    from_region: str
    to_region: str
    transfer_type: str
    data_transfer_gb: float

class CalculationRequest(BaseModel):
    provider: ProviderEnum
    services: List[ServiceConfig]
    data_transfers: Optional[List[DataTransferConfig]] = None
    session_id: Optional[str] = None
    discount_multipliers: Optional[Dict[str, float]] = Field(
        default={
            "reserved-1y": 0.6,
            "reserved-3y": 0.4,
            "spot": 0.1
        },
        description="User-defined discount multipliers for pricing models"
    )

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

class EstimationServiceCreate(BaseModel):
    service_name: str
    region: str
    quantity: int
    monthly_cost: float
    annual_cost: float
    parameters: dict

class EstimationCreate(BaseModel):
    provider: ProviderEnum
    name: str
    services: List[EstimationServiceCreate]
    data: dict
    notes: Optional[str] = None

class EstimationResponse(BaseModel):
    id: UUID
    user_id: UUID
    provider: str
    name: str
    status: str
    total_monthly_cost: float
    total_annual_cost: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PricingCreate(BaseModel):
    provider: str
    service_name: str
    resource_type: str
    region: str
    pricing_model: str
    hourly_price: float
    upfront_cost: Optional[float] = None
    currency: str = "EUR"

class PricingResponse(BaseModel):
    id: UUID
    provider: str
    service_name: str
    resource_type: str
    region: str
    pricing_model: str
    hourly_price: float
    upfront_cost: Optional[float] = None
    currency: str

    class Config:
        from_attributes = True
