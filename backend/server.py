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


ROOT_DIR = Path(__file__).parent
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


# ==================== WORKER MODELS ====================

class Site(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    location: str
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SiteCreate(BaseModel):
    name: str
    location: str


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Attendance Management API", "status": "active"}

# Worker Endpoints
@api_router.post("/workers")
async def create_worker(worker: dict):
    """Create a new worker"""
    worker_id = str(uuid.uuid4())
    worker_data = {
        "id": worker_id,
        "name": worker.get("name"),
        "phone": worker.get("phone"),
        "role": worker.get("role"),
        "daily_rate": worker.get("daily_rate", 500),
        "site_id": worker.get("site_id", "Zonuam Site"),
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    }
    await db.workers.insert_one(worker_data)
    # Remove MongoDB's _id before returning
    worker_data.pop('_id', None)
    return worker_data

@api_router.get("/workers")
async def get_workers(site_id: str = None):
    """Get all workers or filter by site"""
    query = {"site_id": site_id} if site_id else {}
    workers = await db.workers.find(query, {'_id': 0}).to_list(length=1000)
    return workers

@api_router.get("/workers/{worker_id}")
async def get_worker(worker_id: str):
    """Get worker by ID"""
    worker = await db.workers.find_one({"id": worker_id}, {'_id': 0})
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    return worker

# Old status endpoints (keep for compatibility)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
