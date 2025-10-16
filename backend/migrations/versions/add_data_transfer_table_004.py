"""Add data transfer pricing table

Revision ID: add_data_transfer_table_004
Revises: add_upfront_cost_003
Create Date: 2025-10-16 13:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = 'add_data_transfer_table_004'
down_revision = 'add_upfront_cost_003'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'data_transfer_pricing',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('provider', sa.String(50), nullable=False),
        sa.Column('from_region', sa.String(100), nullable=False),
        sa.Column('to_region', sa.String(100), nullable=False),
        sa.Column('transfer_type', sa.String(50), nullable=False),  # "internet-out", "cross-region", "cross-az"
        sa.Column('price_per_gb', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(3), default='EUR'),
        sa.Column('last_updated', sa.DateTime(), nullable=True),
        sa.Column('source', sa.String(50), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint('provider', 'from_region', 'to_region', 'transfer_type', name='uq_data_transfer')
    )
    
    op.create_index(
        'idx_data_transfer_lookup',
        'data_transfer_pricing',
        ['provider', 'from_region', 'to_region', 'transfer_type']
    )

def downgrade() -> None:
    op.drop_index('idx_data_transfer_lookup')
    op.drop_table('data_transfer_pricing')
