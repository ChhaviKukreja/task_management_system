# Task Management System - Server

Backend server for the Task Management System built with Node.js, Express, MongoDB, and JWT authentication.

## Security Alert

**IMPORTANT:** If you cloned this repository before January 14, 2026, please read [SECURITY_ALERT.md](../SECURITY_ALERT.md) immediately. MongoDB credentials were temporarily exposed and have been removed.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variables

## Project Structure

```
server/
├── models/
│   └── User.js           # User schema/model
├── routes/
│   └── auth.js           # Authentication routes
├── middleware/
│   └── auth.js           # JWT verification middleware
├── .env                  # Environment variables
├── server.js             # Entry point
└── package.json          # Dependencies
```

## Getting Started

### Installation

```bash
cd server
npm install
```

### Environment Variables

Create a `.env` file in the server directory:

```bash
cp .env.example .env
```

Then edit `.env` and add your actual credentials:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

**IMPORTANT SECURITY NOTES:**
- Replace `<username>`, `<password>`, `<cluster>`, and `<database>` with your actual MongoDB Atlas credentials
- **NEVER** commit the `.env` file to version control
- The `.env` file is already in `.gitignore` - keep it that way
- Use `.env.example` for documentation and sharing template
- Rotate credentials immediately if accidentally exposed

### Run the Server

```bash
# Production mode
npm start

# Development mode (with auto-restart)
npm run dev
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "username": "johndoe",
      "email": "john@example.com",
      "createdAt": "2026-01-14T...",
      "updatedAt": "2026-01-14T..."
    }
  }
}
```

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2026-01-14T..."
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After logging in or registering, include the token in the Authorization header:

```
Authorization: Bearer <your-token-here>
```

## Models

### User Model

```javascript
{
  username: String (required, unique, 3-30 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token expiration (7 days)
- Protected routes with authentication middleware
- Input validation
- Email format validation
- Password excluded from JSON responses

## Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description"
}
```

## Middleware

### auth.js
Verifies JWT tokens for protected routes. Attaches user data to `req.user` object.

**Usage:**
```javascript
import auth from './middleware/auth.js';

router.get('/protected-route', auth, (req, res) => {
  // Access user data via req.user
});
```

## Dependencies

```json
{
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.2.1",
  "jsonwebtoken": "^9.0.3",
  "mongoose": "^9.1.3"
}
```

## Next Steps

- Add Task model and CRUD operations
- Implement task assignment and status tracking
- Add user roles and permissions
- Implement refresh tokens
- Add rate limiting
- Add request logging
- Add input sanitization
- Add API documentation with Swagger
