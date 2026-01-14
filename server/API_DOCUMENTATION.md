# Task Management System API - Complete Documentation

## Getting Started

### Start the Server
```bash
cd server
npm start
```

Server will run on: `http://localhost:5000`

### Access API Documentation
- **Swagger UI**: http://localhost:5000/api-docs
- **Swagger JSON**: http://localhost:5000/api-docs.json

---

## API Endpoints Reference

### Base URL
```
http://localhost:5000/api
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "67856...",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "67856...",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <your-token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "67856...",
      "username": "johndoe",
      "email": "john@example.com",
      "createdAt": "2026-01-14T...",
      "updatedAt": "2026-01-14T..."
    }
  }
}
```

---

## Task Management Endpoints

> **Note:** All task endpoints require authentication via Bearer token

### 1. Get All Tasks
**GET** `/api/tasks`

**Query Parameters:**
- `status` (optional): Filter by status (`Pending`, `In Progress`, `Completed`)
- `priority` (optional): Filter by priority (`High`, `Medium`, `Low`)
- `category` (optional): Filter by category name
- `sortBy` (optional): Field to sort by (e.g., `createdAt`, `dueDate`, `priority`)
- `order` (optional): Sort order (`asc`, `desc`)

**Example:**
```
GET /api/tasks?status=Pending&priority=High&sortBy=dueDate&order=asc
```

**Response (200):**
```json
{
  "status": "success",
  "count": 2,
  "data": {
    "tasks": [
      {
        "_id": "67856...",
        "title": "Complete project report",
        "description": "Write and submit final report",
        "category": "Work",
        "priority": "High",
        "status": "Pending",
        "dueDate": "2026-01-20T10:00:00Z",
        "user": "67856...",
        "createdAt": "2026-01-14T...",
        "updatedAt": "2026-01-14T..."
      }
    ]
  }
}
```

---

### 2. Get Task by ID
**GET** `/api/tasks/:id`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "task": {
      "_id": "67856...",
      "title": "Complete project report",
      "description": "Write and submit final report",
      "category": "Work",
      "priority": "High",
      "status": "Pending",
      "dueDate": "2026-01-20T10:00:00Z",
      "user": "67856...",
      "createdAt": "2026-01-14T...",
      "updatedAt": "2026-01-14T..."
    }
  }
}
```

---

### 3. Create Task
**POST** `/api/tasks`

**Request Body:**
```json
{
  "title": "Complete project report",
  "description": "Write and submit the final project report",
  "category": "Work",
  "priority": "High",
  "status": "Pending",
  "dueDate": "2026-01-20T10:00:00Z"
}
```

**Required Fields:**
- `title` (string)

**Optional Fields:**
- `description` (string, max 500 chars)
- `category` (string, default: "General")
- `priority` (enum: `High`, `Medium`, `Low`, default: `Medium`)
- `status` (enum: `Pending`, `In Progress`, `Completed`, default: `Pending`)
- `dueDate` (Date)

**Response (201):**
```json
{
  "status": "success",
  "message": "Task created successfully",
  "data": {
    "task": { ... }
  }
}
```

---

### 4. Update Task
**PUT** `/api/tasks/:id`

**Request Body:** (all fields optional)
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "category": "Personal",
  "priority": "Medium",
  "status": "In Progress",
  "dueDate": "2026-01-25T10:00:00Z"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Task updated successfully",
  "data": {
    "task": { ... }
  }
}
```

---

### 5. Delete Task
**DELETE** `/api/tasks/:id`

**Response (200):**
```json
{
  "status": "success",
  "message": "Task deleted successfully",
  "data": {
    "task": { ... }
  }
}
```

---

### 6. Get Task Statistics (Aggregation Pipeline)
**GET** `/api/tasks/stats`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "total": 15,
    "byStatus": {
      "pending": 5,
      "in-progress": 3,
      "completed": 7
    },
    "byPriority": {
      "high": 4,
      "medium": 6,
      "low": 5
    },
    "topCategories": [
      {
        "category": "Work",
        "count": 8
      },
      {
        "category": "Personal",
        "count": 5
      },
      {
        "category": "Shopping",
        "count": 2
      }
    ]
  }
}
```

**Aggregation Features:**
- Groups tasks by **status** and counts
- Groups tasks by **priority** and counts
- Groups tasks by **category** and returns top 5
- Returns **total** count of all tasks

---

## Testing with PowerShell

### 1. Register and Login
```powershell
# Register
$registerBody = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
$token = $response.data.token

# Login
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.data.token
```

---

### 2. Create Tasks
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$taskBody = @{
    title = "Complete project report"
    description = "Write and submit final report"
    category = "Work"
    priority = "High"
    status = "Pending"
    dueDate = "2026-01-20T10:00:00Z"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/tasks" -Method Post -Body $taskBody -ContentType "application/json" -Headers $headers
```

---

### 3. Get All Tasks
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/tasks" -Method Get -Headers $headers
```

---

### 4. Get Tasks with Filters
```powershell
# Get high priority pending tasks
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks?priority=High&status=Pending" -Method Get -Headers $headers

# Get tasks sorted by due date
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks?sortBy=dueDate&order=asc" -Method Get -Headers $headers
```

---

### 5. Update Task
```powershell
$taskId = "YOUR_TASK_ID"
$updateBody = @{
    status = "In Progress"
    priority = "Medium"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/tasks/$taskId" -Method Put -Body $updateBody -ContentType "application/json" -Headers $headers
```

---

### 6. Get Statistics
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks/stats" -Method Get -Headers $headers
```

---

### 7. Delete Task
```powershell
$taskId = "YOUR_TASK_ID"
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks/$taskId" -Method Delete -Headers $headers
```

---

## MongoDB Aggregation Pipeline Details

The `/api/tasks/stats` endpoint uses MongoDB aggregation pipelines:

### Status Aggregation
```javascript
[
  { $match: { user: userId } },
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $project: { _id: 0, status: '$_id', count: 1 } }
]
```

### Priority Aggregation
```javascript
[
  { $match: { user: userId } },
  { $group: { _id: '$priority', count: { $sum: 1 } } },
  { $project: { _id: 0, priority: '$_id', count: 1 } }
]
```

### Category Aggregation (Top 5)
```javascript
[
  { $match: { user: userId } },
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $project: { _id: 0, category: '$_id', count: 1 } },
  { $sort: { count: -1 } },
  { $limit: 5 }
]
```

---

## Swagger Documentation Setup

### Installation
```bash
npm install swagger-ui-express swagger-jsdoc
```

### Configuration File
Location: `server/config/swagger.js`

### Features
- OpenAPI 3.0 specification
- JWT Bearer authentication
- Auto-generated from JSDoc comments
- Interactive API testing interface
- Schema definitions for models
- Request/response examples

### Access Swagger UI
```
http://localhost:5000/api-docs
```

### Using Swagger UI
1. Open http://localhost:5000/api-docs
2. Click "Authorize" button
3. Enter: `Bearer <your-token>`
4. Test endpoints directly from the UI

---

## Advanced Features

### Query Filtering
- Filter by status, priority, category
- Sort by any field (ascending/descending)
- Combine multiple filters

### Data Validation
- Field-level validation with Mongoose
- Enum validation for status and priority
- Required field enforcement
- Max length constraints

### Security
- JWT authentication on all task routes
- User-specific data isolation
- Token expiration (7 days)
- Password hashing with bcrypt

### Performance
- MongoDB indexes on user, status, priority, dueDate
- Efficient aggregation pipelines
- Optimized queries with filters

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Invalid Token |
| 404 | Resource Not Found |
| 500 | Server Error |

---

## Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

Get the token from `/api/auth/login` or `/api/auth/register` response.

---

## Task Model Schema

```javascript
{
  title: String (required, max 100 chars),
  description: String (max 500 chars),
  category: String (default: "General"),
  priority: Enum ["High", "Medium", "Low"] (default: "Medium"),
  status: Enum ["Pending", "In Progress", "Completed"] (default: "Pending"),
  dueDate: Date,
  user: ObjectId (reference to User),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## Tips

1. **Always include the Authorization header** for task endpoints
2. **Use Swagger UI** for interactive API testing
3. **Check `/api/tasks/stats`** for dashboard data
4. **Filter and sort tasks** for better performance
5. **Set proper due dates** in ISO 8601 format

---

## Troubleshooting

### "Access denied. No token provided"
- Include `Authorization: Bearer <token>` header

### "Task not found"
- Verify task ID is correct
- Ensure task belongs to authenticated user

### "Invalid token"
- Token may be expired (7 days)
- Log in again to get a new token

---

## Support

For issues or questions, refer to:
- Swagger Documentation: http://localhost:5000/api-docs
- Health Check: http://localhost:5000/api/health
- Server README: `server/README.md`
