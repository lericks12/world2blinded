"""Initial schema - users and appointments

Revision ID: 1734b7cad868
Revises: 
Create Date: 2026-03-27 03:34:29.679034

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '1734b7cad868'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop existing tables if they exist (from previous Supabase setup)
    op.execute("DROP TABLE IF EXISTS messages CASCADE")
    op.execute("DROP TABLE IF EXISTS profiles CASCADE")
    op.execute("DROP TABLE IF EXISTS appointments CASCADE")
    
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=True, default='client'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index('ix_users_email_password', 'users', ['email', 'password'], unique=False)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)
    
    # Create appointments table
    op.create_table('appointments',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('client_id', sa.String(length=50), nullable=False),
        sa.Column('client_name', sa.String(length=255), nullable=False),
        sa.Column('client_email', sa.String(length=255), nullable=False),
        sa.Column('worker_id', sa.String(length=50), nullable=False),
        sa.Column('worker_name', sa.String(length=255), nullable=False),
        sa.Column('service', sa.String(length=255), nullable=False),
        sa.Column('date', sa.String(length=50), nullable=False),
        sa.Column('time', sa.String(length=50), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True, default=''),
        sa.Column('status', sa.String(length=50), nullable=True, default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_appointments_client_id'), 'appointments', ['client_id'], unique=False)
    op.create_index(op.f('ix_appointments_status'), 'appointments', ['status'], unique=False)
    op.create_index(op.f('ix_appointments_worker_id'), 'appointments', ['worker_id'], unique=False)
    op.create_index('ix_appointments_worker_date_time', 'appointments', ['worker_id', 'date', 'time'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_appointments_worker_date_time', table_name='appointments')
    op.drop_index(op.f('ix_appointments_worker_id'), table_name='appointments')
    op.drop_index(op.f('ix_appointments_status'), table_name='appointments')
    op.drop_index(op.f('ix_appointments_client_id'), table_name='appointments')
    op.drop_table('appointments')
    
    op.drop_index(op.f('ix_users_role'), table_name='users')
    op.drop_index('ix_users_email_password', table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
