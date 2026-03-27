"""
SQLAlchemy Models for World2Blinded
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, Index
from database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = 'users'
    
    id = Column(String(50), primary_key=True, default=lambda: f"user_{uuid.uuid4().hex[:12]}")
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    role = Column(String(50), default='client', index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index('ix_users_email_password', 'email', 'password'),
    )


class Appointment(Base):
    __tablename__ = 'appointments'
    
    id = Column(String(50), primary_key=True, default=lambda: f"appt_{uuid.uuid4().hex[:12]}")
    client_id = Column(String(50), nullable=False, index=True)
    client_name = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=False)
    worker_id = Column(String(50), nullable=False, index=True)
    worker_name = Column(String(255), nullable=False)
    service = Column(String(255), nullable=False)
    date = Column(String(50), nullable=False)
    time = Column(String(50), nullable=False)
    notes = Column(Text, default='')
    status = Column(String(50), default='pending', index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    __table_args__ = (
        Index('ix_appointments_worker_date_time', 'worker_id', 'date', 'time'),
    )
