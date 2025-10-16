"""Data model fixes - add created_by, session_expires_at, constraints

Revision ID: data_model_fixes_002
Revises: add_indexes_001
Create Date: 2025-10-16 13:05:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'data_model_fixes_002'
down_revision = 'add_indexes_001'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('estimations', sa.Column('created_by', sa.String(255), nullable=True))
    
    op.add_column('user_price_overrides', sa.Column('session_expires_at', sa.DateTime(), nullable=True))
    
    op.create_check_constraint(
        'ck_estimation_services_quantity_positive',
        'estimation_services',
        'quantity > 0'
    )

def downgrade() -> None:
    op.drop_constraint('ck_estimation_services_quantity_positive', 'estimation_services')
    op.drop_column('user_price_overrides', 'session_expires_at')
    op.drop_column('estimations', 'created_by')
