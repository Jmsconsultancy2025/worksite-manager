from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
import jwt
import hashlib
from .auth import get_current_user, hash_password, verify_password, create_access_token

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'worksite_manager')]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24 * 30  # 30 days

# Create the main app without a prefix
app = FastAPI(title="Worksite Manager API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()


# ==================== AUTHENTICATION MODELS ====================

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: str = "manager"  # manager, admin, viewer
    company_name: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User


# ==================== SITE MODELS ====================

class Site(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: str
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SiteCreate(BaseModel):
    name: str
    location: str


# ==================== ATTENDANCE MODELS ====================

class Attendance(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    worker_id: str
    date: str  # YYYY-MM-DD format
    status: str  # present, half, absent, holiday
    marked_at: datetime = Field(default_factory=datetime.utcnow)
    marked_by: str  # user_id
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AttendanceCreate(BaseModel):
    worker_id: str
    date: str
    status: str

class AttendanceUpdate(BaseModel):
    status: str


# ==================== SALARY MODELS ====================

class SalaryRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    worker_id: str
    date_from: str
    date_to: str
    total_days: int
    present_days: int
    half_days: int
    absent_days: int
    daily_earnings: float
    overtime: float = 0.0
    adjustments: float = 0.0
    total_advances: float = 0.0
    total_earnings: float
    net_payable: float
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ==================== ADVANCE MODELS ====================

class Advance(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    worker_id: str
    amount: float
    date: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdvanceCreate(BaseModel):
    worker_id: str
    amount: float
    date: str


# ==================== AUTHENTICATION ENDPOINTS ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user = User(
        email=user_data.email,
        name=user_data.name,
        company_name=user_data.company_name
    )

    # Hash password
    hashed_password = hash_password(user_data.password)

    user_dict = user.dict()
    user_dict["password_hash"] = hashed_password
    user_dict["created_at"] = datetime.utcnow()

    # Save to database
    await db.users.insert_one(user_dict)

    # Create access token
    access_token = create_access_token({"user_id": user.id, "email": user.email})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )


@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login existing user"""
    # Find user by email
    user_doc = await db.users.find_one({"email": credentials.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(credentials.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create user object from database document
    user = User(**{k: v for k, v in user_doc.items() if k != "_id" and k != "password_hash"})

    # Create access token
    access_token = create_access_token({"user_id": user.id, "email": user.email})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user
    )


# ==================== SITE ENDPOINTS ====================

@api_router.post("/sites")
async def create_site(site: SiteCreate, current_user: dict = Depends(get_current_user)):
    """Create a new site"""
    site_data = {
        "id": str(uuid.uuid4()),
        "name": site.name,
        "location": site.location,
        "user_id": current_user["id"],
        "created_at": datetime.utcnow().isoformat()
    }
    await db.sites.insert_one(site_data)
    site_data.pop('_id', None)
    return site_data


@api_router.get("/sites")
async def get_sites(current_user: dict = Depends(get_current_user)):
    """Get all sites for current user"""
    sites = await db.sites.find({"user_id": current_user["id"]}, {'_id': 0}).to_list(length=100)
    return sites


# ==================== WORKER ENDPOINTS ====================

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Worksite Manager API", "status": "active"}

# Worker Endpoints
@api_router.post("/workers")
async def create_worker(worker: dict, current_user: dict = Depends(get_current_user)):
    """Create a new worker"""
    worker_id = str(uuid.uuid4())
    worker_data = {
        "id": worker_id,
        "name": worker.get("name"),
        "phone": worker.get("phone"),
        "role": worker.get("role"),
        "daily_rate": worker.get("daily_rate", 500),
        "site_id": worker.get("site_id", "Zonuam Site"),
        "user_id": current_user["id"],
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    }
    await db.workers.insert_one(worker_data)
    # Remove MongoDB's _id before returning
    worker_data.pop('_id', None)
    return worker_data

@api_router.get("/workers")
async def get_workers(site_id: str = None, current_user: dict = Depends(get_current_user)):
    """Get all workers or filter by site"""
    query = {"user_id": current_user["id"]}
    if site_id:
        query["site_id"] = site_id
    workers = await db.workers.find(query, {'_id': 0}).to_list(length=1000)
    return workers

@api_router.get("/workers/{worker_id}")
async def get_worker(worker_id: str, current_user: dict = Depends(get_current_user)):
    """Get worker by ID"""
    worker = await db.workers.find_one({"id": worker_id, "user_id": current_user["id"]}, {'_id': 0})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker


# ==================== ATTENDANCE ENDPOINTS ====================

@api_router.post("/attendance")
async def mark_attendance(attendance_data: AttendanceCreate, current_user: dict = Depends(get_current_user)):
    """Mark or update attendance for a worker"""
    # Check if worker exists and belongs to user
    worker = await db.workers.find_one({"id": attendance_data.worker_id, "user_id": current_user["id"]})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    # Check if attendance already exists for this date
    existing = await db.attendance.find_one({
        "worker_id": attendance_data.worker_id,
        "date": attendance_data.date
    })

    if existing:
        # Update existing attendance
        await db.attendance.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "status": attendance_data.status,
                "marked_at": datetime.utcnow(),
                "marked_by": current_user["id"]
            }}
        )
        # Fetch updated record
        updated = await db.attendance.find_one({"_id": existing["_id"]}, {'_id': 0})
        return updated
    else:
        # Create new attendance record
        attendance = Attendance(
            worker_id=attendance_data.worker_id,
            date=attendance_data.date,
            status=attendance_data.status,
            marked_by=current_user["id"]
        )
        attendance_dict = attendance.dict()
        await db.attendance.insert_one(attendance_dict)
        attendance_dict.pop('_id', None)
        return attendance_dict


@api_router.get("/attendance/{worker_id}")
async def get_worker_attendance(
    worker_id: str,
    date_from: str = None,
    date_to: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get attendance records for a worker"""
    # Check if worker exists and belongs to user
    worker = await db.workers.find_one({"id": worker_id, "user_id": current_user["id"]})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    query = {"worker_id": worker_id}
    if date_from and date_to:
        query["date"] = {"$gte": date_from, "$lte": date_to}

    attendance_records = await db.attendance.find(query, {'_id': 0}).sort("date", -1).to_list(length=1000)
    return attendance_records


@api_router.put("/attendance/{attendance_id}")
async def update_attendance(
    attendance_id: str,
    update_data: AttendanceUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update attendance status"""
    # Find attendance record
    attendance = await db.attendance.find_one({"id": attendance_id})
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    # Check if worker belongs to user
    worker = await db.workers.find_one({"id": attendance["worker_id"], "user_id": current_user["id"]})
    if not worker:
        raise HTTPException(status_code=403, detail="Access denied")

    # Update attendance
    await db.attendance.update_one(
        {"id": attendance_id},
        {"$set": {
            "status": update_data.status,
            "marked_at": datetime.utcnow(),
            "marked_by": current_user["id"]
        }}
    )

    # Return updated record
    updated = await db.attendance.find_one({"id": attendance_id}, {'_id': 0})
    return updated


# ==================== SALARY ENDPOINTS ====================

@api_router.get("/salary/{worker_id}")
async def calculate_salary(
    worker_id: str,
    date_from: str,
    date_to: str,
    current_user: dict = Depends(get_current_user)
):
    """Calculate salary for a worker over a period"""
    # Check if worker exists and belongs to user
    worker = await db.workers.find_one({"id": worker_id, "user_id": current_user["id"]})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    # Get attendance records for the period
    attendance_records = await db.attendance.find({
        "worker_id": worker_id,
        "date": {"$gte": date_from, "$lte": date_to}
    }).to_list(length=1000)

    # Calculate days
    present_days = sum(1 for a in attendance_records if a["status"] == "present")
    half_days = sum(1 for a in attendance_records if a["status"] == "half")
    absent_days = sum(1 for a in attendance_records if a["status"] == "absent")
    total_days = len(attendance_records)

    # Calculate earnings
    daily_rate = worker.get("daily_rate", 500)
    daily_earnings = (present_days * daily_rate) + (half_days * daily_rate * 0.5)

    # Get advances for the period
    advances = await db.advances.find({
        "worker_id": worker_id,
        "date": {"$gte": date_from, "$lte": date_to}
    }).to_list(length=1000)
    total_advances = sum(a["amount"] for a in advances)

    # Calculate totals
    total_earnings = daily_earnings  # Add overtime and adjustments later if needed
    net_payable = total_earnings - total_advances

    salary_record = SalaryRecord(
        worker_id=worker_id,
        date_from=date_from,
        date_to=date_to,
        total_days=total_days,
        present_days=present_days,
        half_days=half_days,
        absent_days=absent_days,
        daily_earnings=daily_earnings,
        total_advances=total_advances,
        total_earnings=total_earnings,
        net_payable=net_payable
    )

    return salary_record.dict()


# ==================== ADVANCE ENDPOINTS ====================

@api_router.post("/advances")
async def record_advance(advance_data: AdvanceCreate, current_user: dict = Depends(get_current_user)):
    """Record an advance payment"""
    # Check if worker exists and belongs to user
    worker = await db.workers.find_one({"id": advance_data.worker_id, "user_id": current_user["id"]})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    advance = Advance(
        worker_id=advance_data.worker_id,
        amount=advance_data.amount,
        date=advance_data.date
    )

    advance_dict = advance.dict()
    await db.advances.insert_one(advance_dict)
    advance_dict.pop('_id', None)
    return advance_dict


@api_router.get("/advances/{worker_id}")
async def get_worker_advances(
    worker_id: str,
    date_from: str = None,
    date_to: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Get advance payments for a worker"""
    # Check if worker exists and belongs to user
    worker = await db.workers.find_one({"id": worker_id, "user_id": current_user["id"]})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    query = {"worker_id": worker_id}
    if date_from and date_to:
        query["date"] = {"$gte": date_from, "$lte": date_to}

    advances = await db.advances.find(query, {'_id': 0}).sort("date", -1).to_list(length=1000)
    return advances


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Vercel serverless function handler
def handler(event, context):
    """Vercel serverless function handler"""
    from mangum import Mangum

    # Create Mangum handler for FastAPI
    mangum_handler = Mangum(app, lifespan="off")

    return mangum_handler(event, context)