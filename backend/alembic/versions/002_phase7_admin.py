"""phase7 admin control center

Revision ID: 002_phase7_admin
Revises: 001_phase6_initial
Create Date: 2026-09-08 19:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = '002_phase7_admin'
down_revision = '001_phase6_initial'
branch_labels = None
depends_on = None

def upgrade():
    # Add columns to schemes table
    op.add_column('schemes', sa.Column('status', sa.String(), nullable=True, server_default='PUBLISHED'))
    op.add_column('schemes', sa.Column('verification_status', sa.String(), nullable=True, server_default='VERIFIED'))
    op.add_column('schemes', sa.Column('verified_by', sa.String(), nullable=True))
    op.add_column('schemes', sa.Column('verification_notes', sa.Text(), nullable=True))
    op.add_column('schemes', sa.Column('next_verification_due_at', sa.DateTime(), nullable=True))
    op.add_column('schemes', sa.Column('source_checked_at', sa.DateTime(), nullable=True))
    op.add_column('schemes', sa.Column('source_type', sa.String(), nullable=True, server_default='CENTRAL_GOVERNMENT'))
    op.add_column('schemes', sa.Column('source_name', sa.String(), nullable=True))
    op.add_column('schemes', sa.Column('quality_score', sa.Float(), nullable=True, server_default='95.0'))

    # Create scheme_versions table
    op.create_table(
        'scheme_versions',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('scheme_id', sa.String(), sa.ForeignKey('schemes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False, default=1),
        sa.Column('changed_by_user_id', sa.String(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('changed_by_name', sa.String(), nullable=True),
        sa.Column('change_summary', sa.String(), nullable=False),
        sa.Column('changed_fields', sa.JSON(), nullable=True),
        sa.Column('snapshot_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

    # Create scheme_verifications table
    op.create_table(
        'scheme_verifications',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('scheme_id', sa.String(), sa.ForeignKey('schemes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('verified_by_user_id', sa.String(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('verified_by_name', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, default='VERIFIED'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('checks_performed', sa.JSON(), nullable=True),
        sa.Column('verified_at', sa.DateTime(), nullable=True)
    )

    # Create scheme_source_checks table
    op.create_table(
        'scheme_source_checks',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('scheme_id', sa.String(), sa.ForeignKey('schemes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('source_url', sa.String(), nullable=False),
        sa.Column('http_status', sa.Integer(), nullable=True),
        sa.Column('reachability', sa.String(), nullable=False, default='REACHABLE'),
        sa.Column('response_time_ms', sa.Integer(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('checked_at', sa.DateTime(), nullable=True)
    )

    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('actor_id', sa.String(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('actor_name', sa.String(), nullable=True),
        sa.Column('actor_role', sa.String(), nullable=True),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('entity_type', sa.String(), nullable=True),
        sa.Column('entity_id', sa.String(), nullable=True),
        sa.Column('change_summary', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(), nullable=True),
        sa.Column('user_agent', sa.String(), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

    # Create admin_settings table
    op.create_table(
        'admin_settings',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('key', sa.String(), unique=True, nullable=False),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('category', sa.String(), default='General'),
        sa.Column('updated_by', sa.String(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True)
    )

    # Create feature_flags table
    op.create_table(
        'feature_flags',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('key', sa.String(), unique=True, nullable=False),
        sa.Column('enabled', sa.Boolean(), default=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('updated_by', sa.String(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True)
    )

    # Create background_jobs table
    op.create_table(
        'background_jobs',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('job_name', sa.String(), nullable=False),
        sa.Column('status', sa.String(), default='QUEUED'),
        sa.Column('started_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('duration_ms', sa.Integer(), nullable=True),
        sa.Column('attempts', sa.Integer(), default=1),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

    # Create analytics_events table
    op.create_table(
        'analytics_events',
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('entity_type', sa.String(), nullable=True),
        sa.Column('entity_id', sa.String(), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )

def downgrade():
    op.drop_table('analytics_events')
    op.drop_table('background_jobs')
    op.drop_table('feature_flags')
    op.drop_table('admin_settings')
    op.drop_table('audit_logs')
    op.drop_table('scheme_source_checks')
    op.drop_table('scheme_verifications')
    op.drop_table('scheme_versions')
    op.drop_column('schemes', 'quality_score')
    op.drop_column('schemes', 'source_name')
    op.drop_column('schemes', 'source_type')
    op.drop_column('schemes', 'source_checked_at')
    op.drop_column('schemes', 'next_verification_due_at')
    op.drop_column('schemes', 'verification_notes')
    op.drop_column('schemes', 'verified_by')
    op.drop_column('schemes', 'verification_status')
    op.drop_column('schemes', 'status')
