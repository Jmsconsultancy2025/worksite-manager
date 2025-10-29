# Worksite Manager - Production Backend Documentation

## Overview
Complete cloud-based attendance and worker management system with MongoDB database, FastAPI backend, and React Native frontend.

## Architecture

### Technology Stack
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (Emergent Integrated)
- **Frontend**: React Native with Expo
- **Authentication**: JWT tokens
- **API Style**: REST

### Database Collections

#### 1. Users Collection
```json
{
  "id": "uuid",
  "email": "manager@example.com",
  "password_hash": "sha256_hash",
  "name": "John Doe",
  "role": "manager|admin|viewer",
  "company_name": "ABC Construction",
  "created_at": "timestamp"
}
```

#### 2. Sites Collection
```json
{
  "id": "uuid",
  "name": "Downtown Site",
  "location": "123 Main St",
  "user_id": "owner_uuid",
  "created_at": "timestamp"
}
```

#### 3. Workers Collection
```json
{
  "id": "uuid",
  "name": "Rajesh Kumar",
  "phone": "+91-9876543210",
  "role": "Mason|Carpenter|Helper",
  "daily_rate": 500.0,
  "site_id": "site_uuid",
  "user_id": "manager_uuid",
  "status": "active|inactive",
  "created_at": "timestamp"
}
```

#### 4. Attendance Collection
```json
{
  "id": "uuid",
  "worker_id": "worker_uuid",
  "date": "2025-01-15",
  "status": "present|half|absent|holiday",
  "marked_at": "2025-01-15T08:30:00Z",
  "marked_by": "user_uuid",
  "created_at": "timestamp"
}
```

#### 5. Salary Records Collection
```json
{
  "id": "uuid",
  "worker_id": "worker_uuid",
  "date_from": "2025-01-01",
  "date_to": "2025-01-31",
  "total_days": 31,
  "present_days": 25,
  "half_days": 2,
  "absent_days": 4,
  "daily_earnings": 13000.0,
  "overtime": 500.0,
  "adjustments": 200.0,
  "total_advances": 5000.0,
  "total_earnings": 13700.0,
  "net_payable": 8700.0,
  "created_at": "timestamp"
}
```

#### 6. Advances Collection
```json
{
  "id": "uuid",
  "worker_id": "worker_uuid",
  "amount": 1000.0,
  "date": "2025-01-15",
  "created_at": "timestamp"
}
```

## API Endpoints

### Base URL
- **Development**: `http://localhost:8001/api`
- **Production**: `https://your-domain.com/api`

### Authentication Endpoints

#### POST /api/auth/register
Register a new user
```json
Request:
{
  "email": "manager@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "company_name": "ABC Construction"
}

Response:
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "manager@example.com",
    "name": "John Doe",
    "role": "manager"
  }
}
```

#### POST /api/auth/login
Login existing user
```json
Request:
{
  "email": "manager@example.com",
  "password": "securepassword"
}

Response:
{
  "access_token": "jwt_token_here",
  "token_type": "bearer",
  "user": {...}
}
```

### Worker Endpoints

#### POST /api/workers
Create new worker (requires authentication)
```json
Headers:
Authorization: Bearer {token}

Request:
{
  "name": "Rajesh Kumar",
  "phone": "+91-9876543210",
  "role": "Mason",
  "daily_rate": 500.0,
  "site_id": "site_uuid"
}

Response: Worker object
```

#### GET /api/workers
Get all workers (with optional site filter)
```json
Headers:
Authorization: Bearer {token}

Query Params:
?site_id=site_uuid (optional)

Response: Array of Worker objects
```

#### GET /api/workers/{worker_id}
Get worker details
```json
Headers:
Authorization: Bearer {token}

Response: Worker object
```

### Attendance Endpoints

#### POST /api/attendance
Mark or update attendance
```json
Headers:
Authorization: Bearer {token}

Request:
{
  "worker_id": "worker_uuid",
  "date": "2025-01-15",
  "status": "present"
}

Response: Attendance object with marked_at timestamp
```

#### GET /api/attendance/{worker_id}
Get attendance records for a worker
```json
Headers:
Authorization: Bearer {token}

Query Params:
?date_from=2025-01-01&date_to=2025-01-31 (optional)

Response: Array of Attendance objects
```

#### PUT /api/attendance/{attendance_id}
Update attendance status
```json
Headers:
Authorization: Bearer {token}

Request:
{
  "status": "half"
}

Response: Updated Attendance object
```

### Salary Endpoints

#### GET /api/salary/{worker_id}
Calculate salary for a period
```json
Headers:
Authorization: Bearer {token}

Query Params:
?date_from=2025-01-01&date_to=2025-01-31

Response: SalaryRecord object with automatic calculations
```

### Advance Endpoints

#### POST /api/advances
Record advance payment
```json
Headers:
Authorization: Bearer {token}

Request:
{
  "worker_id": "worker_uuid",
  "amount": 1000.0,
  "date": "2025-01-15"
}

Response: Advance object
```

#### GET /api/advances/{worker_id}
Get advance payments
```json
Headers:
Authorization: Bearer {token}

Query Params:
?date_from=2025-01-01&date_to=2025-01-31 (optional)

Response: Array of Advance objects
```

## Frontend Integration

### Setup

1. Install API service:
```javascript
import { attendanceAPI, workerAPI, salaryAPI, advanceAPI } from '../lib/api';
```

2. Store auth token after login:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// After login
await AsyncStorage.setItem('auth_token', token);

// For API calls
const token = await AsyncStorage.getItem('auth_token');
```

### Example Usage

#### Mark Attendance
```javascript
import { attendanceAPI } from '../lib/api';

const markAttendance = async (workerId, date, status) => {
  try {
    const result = await attendanceAPI.mark(workerId, date, status);
    console.log('Attendance marked:', result);
    // Update UI
  } catch (error) {
    console.error('Error marking attendance:', error);
    Alert.alert('Error', 'Failed to mark attendance');
  }
};

// Usage
await markAttendance('worker-123', '2025-01-15', 'present');
```

#### Get Worker Attendance
```javascript
const loadAttendance = async (workerId, dateFrom, dateTo) => {
  try {
    const attendance = await attendanceAPI.get(workerId, dateFrom, dateTo);
    setAttendanceData(attendance);
  } catch (error) {
    console.error('Error loading attendance:', error);
  }
};
```

#### Calculate Salary
```javascript
const calculateSalary = async (workerId, dateFrom, dateTo) => {
  try {
    const salary = await salaryAPI.calculate(workerId, dateFrom, dateTo);
    setSalaryData(salary);
  } catch (error) {
    console.error('Error calculating salary:', error);
  }
};
```

## Business Logic

### Attendance Status & 24-Hour Rule

**Visual Color Coding:**
- Present (P) → Green (#4CAF50) for 24 hours → Gray
- Half (H) → Yellow (#FFC107) for 24 hours → Gray
- Absent (A) → Red (#F44336) for 24 hours → Gray

**Implementation:**
```javascript
// Frontend helper
export function isExpired(markedAt) {
  const now = Date.now();
  const markedTime = new Date(markedAt).getTime();
  const elapsed = now - markedTime;
  return elapsed > (24 * 60 * 60 * 1000);
}

export function getStatusColor(status, markedAt) {
  if (isExpired(markedAt)) return '#9E9E9E'; // Gray
  
  switch (status) {
    case 'present': return '#4CAF50';
    case 'half': return '#FFC107';
    case 'absent': return '#F44336';
    default: return '#E0E0E0';
  }
}
```

### Automatic Salary Calculation

**Formula:**
```
Daily Earnings = (Present Days × Daily Rate) + (Half Days × Daily Rate × 0.5)
Total Earnings = Daily Earnings + Overtime + Other Adjustments
Net Payable = Total Earnings - Total Advance Payments
```

**Backend Implementation:**
The backend automatically calculates salary when you call `/api/salary/{worker_id}`:
1. Fetches all attendance records for the period
2. Counts present, half, and absent days
3. Calculates daily earnings based on daily rate
4. Fetches advance payments for the period
5. Returns complete salary breakdown

## Cloud Sync

### How it Works

1. **Write Operations**: All data mutations (mark attendance, add worker, record advance) immediately save to MongoDB via API calls.

2. **Read Operations**: All data fetching (get workers, load attendance) pulls fresh data from MongoDB.

3. **Multi-Device Sync**: Because all data is stored in MongoDB:
   - Mark attendance on Device A → Instantly available on Device B
   - Add worker on Web → Immediately visible on Mobile
   - No manual sync required

### Testing Cloud Sync

```bash
# Terminal 1: Mark attendance via API
curl -X POST http://localhost:8001/api/attendance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"worker_id":"worker-123","date":"2025-01-15","status":"present"}'

# Terminal 2: Fetch attendance from another "device"
curl http://localhost:8001/api/attendance/worker-123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Result: Attendance marked in Terminal 1 is immediately visible in Terminal 2
```

## Deployment

### Environment Variables

Create `.env` file in backend directory:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=worksite_manager
JWT_SECRET_KEY=your-secure-random-secret-key-here
```

### Running the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Running the Frontend

```bash
cd frontend
yarn install
expo start
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Change JWT_SECRET_KEY to a strong random value**
3. **Implement rate limiting on authentication endpoints**
4. **Validate and sanitize all user inputs**
5. **Use environment variables for sensitive data**
6. **Implement proper CORS policies**
7. **Add request logging and monitoring**

## API Testing

### Using curl

```bash
# Register user
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Mark attendance (use token from login)
curl -X POST http://localhost:8001/api/attendance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"worker_id":"worker-123","date":"2025-01-15","status":"present"}'
```

## Support

For issues or questions:
- Backend API: Check logs at `/var/log/supervisor/backend.err.log`
- Frontend: Check Metro bundler logs
- Database: Verify MongoDB is running

## Version
1.0.0 - Production Ready with Cloud Sync
