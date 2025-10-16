from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import uuid
from .base import Base

class Estimation(Base):
    __tablename__ = 'estimations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255))
    provider = Column(String(50))
    name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String(50), default='draft')
    total_monthly_cost = Column(Float)
    total_annual_cost = Column(Float)
    data = Column(JSONB)
    notes = Column(Text)

    services = relationship('EstimationService', back_populates='estimation', cascade='all, delete-orphan')

class EstimationService(Base):
    __tablename__ = 'estimation_services'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    estimation_id = Column(UUID(as_uuid=True), ForeignKey('estimations.id'), nullable=False)
    service_name = Column(String(100))
    region = Column(String(100))
    quantity = Column(Integer)
    monthly_cost = Column(Float)
    annual_cost = Column(Float)
    parameters = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)

    estimation = relationship('Estimation', back_populates='services')

class EstimationVersion(Base):
    __tablename__ = 'estimation_versions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    estimation_id = Column(UUID(as_uuid=True), ForeignKey('estimations.id'), nullable=False)
    version_number = Column(Integer)
    changes_description = Column(Text)
    snapshot = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserPriceOverride(Base):
    __tablename__ = 'user_price_overrides'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), nullable=False)
    pricing_id = Column(UUID(as_uuid=True), ForeignKey('pricing.id'), nullable=False)
    custom_hourly_price = Column(Float)
    reason = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    session_expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24))

class PricingProposal(Base):
    __tablename__ = 'pricing_proposals'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255))
    pricing_id = Column(UUID(as_uuid=True), ForeignKey('pricing.id'), nullable=False)
    proposed_hourly_price = Column(Float)
    rationale = Column(Text)
    status = Column(String(50), default='pending')
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(String(255))
