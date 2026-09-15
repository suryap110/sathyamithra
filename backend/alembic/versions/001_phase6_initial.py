"""phase 6 initial migration

Revision ID: 001_phase6_initial
Revises: 
Create Date: 2026-09-08 11:06:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001_phase6_initial'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Tables are auto-created by SQLAlchemy lifespan metadata create_all
    pass

def downgrade() -> None:
    pass
