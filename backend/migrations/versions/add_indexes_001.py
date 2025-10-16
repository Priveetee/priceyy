"""Add database indexes for performance

Revision ID: add_indexes_001
Revises: cafae8355d0b
Create Date: 2025-10-16 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'add_indexes_001'
down_revision = 'cafae8355d0b'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_index(
        'idx_pricing_lookup',
        'pricing',
        ['provider', 'service_name', 'resource_type', 'region', 'pricing_model'],
        unique=True
    )
    
    op.create_index(
        'idx_pricing_last_updated',
        'pricing',
        ['last_updated']
    )
    
    op.create_index(
        'idx_estimation_user_id',
        'estimations',
        ['user_id']
    )
    
    op.create_index(
        'idx_estimation_created_at',
        'estimations',
        ['created_at']
    )
    
    op.create_index(
        'idx_estimation_services_estimation_id',
        'estimation_services',
        ['estimation_id']
    )
    
    op.create_index(
        'idx_user_price_overrides_session_id',
        'user_price_overrides',
        ['session_id']
    )

def downgrade() -> None:
    op.drop_index('idx_user_price_overrides_session_id')
    op.drop_index('idx_estimation_services_estimation_id')
    op.drop_index('idx_estimation_created_at')
    op.drop_index('idx_estimation_user_id')
    op.drop_index('idx_pricing_last_updated')
    op.drop_index('idx_pricing_lookup')
