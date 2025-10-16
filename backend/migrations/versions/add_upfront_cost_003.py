"""Add upfront_cost column for reserved instances

Revision ID: add_upfront_cost_003
Revises: data_model_fixes_002
Create Date: 2025-10-16 13:10:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'add_upfront_cost_003'
down_revision = 'data_model_fixes_002'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column('pricing', sa.Column('upfront_cost', sa.Float(), nullable=True))

def downgrade() -> None:
    op.drop_column('pricing', 'upfront_cost')
