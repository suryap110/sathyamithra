"""phase8 mobile device & push token schema

Revision ID: 003_phase8_mobile
Revises: 002_phase7_admin
Create Date: 2026-09-08 20:20:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '003_phase8_mobile'
down_revision = '002_phase7_admin'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'user_devices',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('device_id', sa.String(), nullable=True),
        sa.Column('platform', sa.String(), nullable=False, default='android'),
        sa.Column('push_token', sa.String(), nullable=False, unique=True),
        sa.Column('app_version', sa.String(), default='1.0.0'),
        sa.Column('os_version', sa.String(), nullable=True),
        sa.Column('locale', sa.String(), default='en'),
        sa.Column('timezone', sa.String(), default='Asia/Kolkata'),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('last_seen_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )
    op.create_index('ix_user_devices_user_id', 'user_devices', ['user_id'])
    op.create_index('ix_user_devices_push_token', 'user_devices', ['push_token'])

def downgrade():
    op.drop_index('ix_user_devices_push_token', table_name='user_devices')
    op.drop_index('ix_user_devices_user_id', table_name='user_devices')
    op.drop_table('user_devices')
