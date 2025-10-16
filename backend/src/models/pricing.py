from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class Pricing(Base):
    __tablename__ = 'pricing'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider = Column(String(50), nullable=False)
    service_name = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)
    pricing_model = Column(String(50), nullable=False)
    hourly_price = Column(Float, nullable=False)
    yearly_commitment_discount = Column(Float)
    currency = Column(String(3), default='EUR')
    last_updated = Column(DateTime, default=datetime.utcnow)
    source = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    history = relationship('PricingHistory', back_populates='pricing', cascade='all, delete-orphan')

class PricingHistory(Base):
    __tablename__ = 'pricing_history'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pricing_id = Column(UUID(as_uuid=True), ForeignKey('pricing.id'), nullable=False)
    old_hourly_price = Column(Float)
    new_hourly_price = Column(Float)
    change_reason = Column(String(255))
    changed_at = Column(DateTime, default=datetime.utcnow)
    
    pricing = relationship('Pricing', back_populates='history')
