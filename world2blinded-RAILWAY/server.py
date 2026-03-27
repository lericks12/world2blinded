from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import hashlib
import jwt

# Import database and models
from database import get_db, engine, AsyncSessionLocal
from models import User, Appointment

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Secret
JWT_SECRET = os.environ.get('JWT_SECRET', 'world2blinded-secret-key-2024')
JWT_ALGORITHM = "HS256"

# Security
security = HTTPBearer(auto_error=False)

# Create the main app
app = FastAPI(title="World2Blinded API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════
# PYDANTIC MODELS
# ═══════════════════════════════════════════

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "client"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: str

class AppointmentCreate(BaseModel):
    worker_id: str
    worker_name: str
    service: str
    date: str
    time: str
    notes: Optional[str] = ""

class AppointmentResponse(BaseModel):
    id: str
    client_id: str
    client_name: str
    client_email: str
    worker_id: str
    worker_name: str
    service: str
    date: str
    time: str
    notes: str
    status: str
    created_at: str

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

# ═══════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc).timestamp() + (7 * 24 * 60 * 60)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")

def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

def appointment_to_dict(appt: Appointment) -> dict:
    return {
        "id": appt.id,
        "client_id": appt.client_id,
        "client_name": appt.client_name,
        "client_email": appt.client_email,
        "worker_id": appt.worker_id,
        "worker_name": appt.worker_name,
        "service": appt.service,
        "date": appt.date,
        "time": appt.time,
        "notes": appt.notes or "",
        "status": appt.status,
        "created_at": appt.created_at.isoformat() if appt.created_at else None
    }

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    payload = verify_token(credentials.credentials)
    
    result = await db.execute(select(User).where(User.id == payload["user_id"]))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    
    return user

async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
):
    if not credentials:
        return None
    try:
        payload = verify_token(credentials.credentials)
        result = await db.execute(select(User).where(User.id == payload["user_id"]))
        user = result.scalar_one_or_none()
        return user
    except:
        return None

# ═══════════════════════════════════════════
# AUTH ROUTES
# ═══════════════════════════════════════════

@api_router.post("/auth/register")
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Un compte avec cet email existe déjà")
    
    # Create user
    user = User(
        id=f"user_{uuid.uuid4().hex[:12]}",
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        role=user_data.role,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Generate token
    token = create_token(user.id, user.email, user.role)
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(
            and_(
                User.email == credentials.email,
                User.password == hash_password(credentials.password)
            )
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_token(user.id, user.email, user.role)
    
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }

# ═══════════════════════════════════════════
# WORKERS ROUTES
# ═══════════════════════════════════════════

@api_router.get("/workers")
async def get_workers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.role == "worker"))
    workers = result.scalars().all()
    return [user_to_dict(w) for w in workers]

# ═══════════════════════════════════════════
# APPOINTMENTS ROUTES
# ═══════════════════════════════════════════

@api_router.post("/appointments")
async def create_appointment(
    appointment_data: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if slot is already booked
    result = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.worker_id == appointment_data.worker_id,
                Appointment.date == appointment_data.date,
                Appointment.time == appointment_data.time,
                Appointment.status != "cancelled"
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(status_code=400, detail="Ce créneau est déjà réservé")
    
    appointment = Appointment(
        id=f"appt_{uuid.uuid4().hex[:12]}",
        client_id=current_user.id,
        client_name=current_user.name,
        client_email=current_user.email,
        worker_id=appointment_data.worker_id,
        worker_name=appointment_data.worker_name,
        service=appointment_data.service,
        date=appointment_data.date,
        time=appointment_data.time,
        notes=appointment_data.notes or "",
        status="pending",
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    
    logger.info(f"New appointment created: {appointment.id} by {current_user.email}")
    
    return {"message": "Rendez-vous créé avec succès", "appointment": appointment_to_dict(appointment)}

@api_router.get("/appointments/my")
async def get_my_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Appointment)
        .where(Appointment.client_id == current_user.id)
        .order_by(Appointment.created_at.desc())
    )
    appointments = result.scalars().all()
    
    return [appointment_to_dict(a) for a in appointments]

@api_router.get("/appointments/worker")
async def get_worker_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "worker":
        raise HTTPException(status_code=403, detail="Accès réservé aux experts")
    
    result = await db.execute(
        select(Appointment)
        .where(Appointment.worker_id == current_user.id)
        .order_by(Appointment.created_at.desc())
    )
    appointments = result.scalars().all()
    
    return [appointment_to_dict(a) for a in appointments]

@api_router.get("/appointments/booked-slots")
async def get_booked_slots(worker_id: str, date: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Appointment.time).where(
            and_(
                Appointment.worker_id == worker_id,
                Appointment.date == date,
                Appointment.status != "cancelled"
            )
        )
    )
    slots = result.scalars().all()
    
    return list(slots)

@api_router.patch("/appointments/{appointment_id}")
async def update_appointment(
    appointment_id: str,
    update_data: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Appointment).where(Appointment.id == appointment_id))
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouvé")
    
    # Only worker or client can update
    if current_user.id != appointment.client_id and current_user.id != appointment.worker_id:
        if current_user.role != "worker":
            raise HTTPException(status_code=403, detail="Non autorisé")
    
    if update_data.status:
        appointment.status = update_data.status
    if update_data.notes is not None:
        appointment.notes = update_data.notes
    
    await db.commit()
    
    return {"message": "Rendez-vous mis à jour"}

# ═══════════════════════════════════════════
# ADMIN ROUTES
# ═══════════════════════════════════════════

@api_router.get("/admin/appointments")
async def admin_get_all_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "worker":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    result = await db.execute(
        select(Appointment).order_by(Appointment.created_at.desc())
    )
    appointments = result.scalars().all()
    
    return [appointment_to_dict(a) for a in appointments]

@api_router.get("/admin/users")
async def admin_get_all_users(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "worker":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    
    return [user_to_dict(u) for u in users]

@api_router.get("/admin/stats")
async def admin_get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "worker":
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    
    # Total clients
    result = await db.execute(select(func.count()).select_from(User).where(User.role == "client"))
    total_users = result.scalar()
    
    # Total appointments
    result = await db.execute(select(func.count()).select_from(Appointment))
    total_appointments = result.scalar()
    
    # Pending appointments
    result = await db.execute(
        select(func.count()).select_from(Appointment).where(Appointment.status == "pending")
    )
    pending_appointments = result.scalar()
    
    # Confirmed appointments
    result = await db.execute(
        select(func.count()).select_from(Appointment).where(Appointment.status == "confirmed")
    )
    confirmed_appointments = result.scalar()
    
    return {
        "total_clients": total_users,
        "total_appointments": total_appointments,
        "pending_appointments": pending_appointments,
        "confirmed_appointments": confirmed_appointments
    }

# ═══════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════

@api_router.get("/")
async def root():
    return {"message": "World2Blinded API", "status": "online", "database": "Supabase PostgreSQL"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# ═══════════════════════════════════════════
# INITIALIZATION
# ═══════════════════════════════════════════

@app.on_event("startup")
async def startup_event():
    async with AsyncSessionLocal() as db:
        # Create default admin user if not exists
        result = await db.execute(select(User).where(User.email == "admin@world2blinded.com"))
        admin = result.scalar_one_or_none()
        
        if not admin:
            admin_user = User(
                id="admin_001",
                name="Admin World2Blinded",
                email="admin@world2blinded.com",
                password=hash_password("admin123"),
                role="worker",
                created_at=datetime.now(timezone.utc)
            )
            db.add(admin_user)
            await db.commit()
            logger.info("Default admin user created")
        
        logger.info("Database initialized with Supabase PostgreSQL")

@app.on_event("shutdown")
async def shutdown_db_client():
    await engine.dispose()

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
