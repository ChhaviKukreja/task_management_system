# Task Management System

## Overview

A full-stack task management application built with the MERN stack (MongoDB, Express.js, React, Node.js). This application provides a complete solution for managing tasks with user authentication, task CRUD operations, filtering, sorting, and real-time statistics tracking.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Task Filtering**: Filter tasks by status, priority, and category
- **Task Sorting**: Sort tasks by due date (ascending order)
- **Real-time Statistics**: Dashboard with task counts by status (Total, Pending, In Progress, Completed)
- **Search Functionality**: Search tasks by title or description
- **Responsive Design**: Modern UI with Tailwind CSS and glassmorphism effects
- **Form Validation**: Client-side validation with real-time error feedback
- **Overdue Tracking**: Visual indicators for overdue tasks with color coding
- **Password Strength Indicator**: Real-time password strength feedback during registration

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 7.3.1** - Build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework with PostCSS plugin
- **React Router Dom** - Client-side routing
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js 16+** - JavaScript runtime
- **Express 5.2.1** - Web framework with ES6 modules
- **MongoDB Atlas** - Cloud NoSQL database
- **Mongoose 9.1.3** - MongoDB ODM with schema validation
- **JSON Web Tokens (JWT)** - Stateless authentication (7-day expiration)
- **Bcrypt.js** - Password hashing (10 salt rounds)
- **CORS** - Cross-origin resource sharing
- **Swagger UI Express** - API documentation

### Development Tools
- **Dotenv** - Environment variable management
- **Nodemon** - Auto-restart development server

## Database Schema

### User Model
```javascript
{
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // hashed with bcrypt
  createdAt: { type: Date, default: Date.now }
}
```

### Task Model
```javascript
{
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  dueDate: { type: Date, required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes for optimized queries
indexes: [
  { user: 1, status: 1 },
  { user: 1, priority: 1 },
  { user: 1, dueDate: 1 }
]
```

## Setup Instructions

### Prerequisites
- Node.js 16 or higher
- MongoDB Atlas account (or local MongoDB instance)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-management-system
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the server directory:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database-name>

   # JWT Configuration
   JWT_SECRET=super_secure_jwt_secret_key
   JWT_EXPIRE=7d
   ```

4. **Start the backend server**
   ```bash
   npm run dev    # Development mode with nodemon
   # OR
   npm start      # Production mode
   ```

   The server will start on `http://localhost:5000`

5. **Access API Documentation**
   
   Open your browser and navigate to:
   ```
   http://localhost:5000/api-docs
   ```
   This will show the interactive Swagger UI documentation for all API endpoints.

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../client
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Create a `.env` file in the client directory:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

### Database Setup

The application uses MongoDB with Mongoose ODM. Database schema is automatically created when you run the application for the first time.

**MongoDB Collections Created:**
- `users` - Stores user accounts
- `tasks` - Stores tasks with user references

**Automatic Indexes:**
The Task model includes compound indexes for optimized queries:
- `user + status` - Fast filtering by user and status
- `user + priority` - Fast filtering by user and priority  
- `user + dueDate` - Fast sorting by user and due date

No manual migrations required - Mongoose handles schema creation automatically.

## API Documentation

The application includes comprehensive Swagger/OpenAPI documentation accessible at:
```
http://localhost:5000/api-docs
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

#### Tasks
- `GET /api/tasks` - Get all tasks (with filtering and sorting)
  - Query params: `priority`, `status`, `category`, `sortBy`, `order`
- `GET /api/tasks/stats` - Get task statistics (MongoDB aggregation)
- `POST /api/tasks` - Create new task (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)

All task endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Features Implemented

### Core Functionality
- User registration and authentication with JWT
- Secure password hashing with bcrypt
- Protected routes with JWT middleware
- Task CRUD operations (Create, Read, Update, Delete)
- Task filtering by status, priority, and category
- Task sorting by due date (ascending)
- Search functionality by title and description
- Real-time task statistics dashboard

### UI/UX Features
- Modern responsive design with Tailwind CSS
- Animated gradient backgrounds with pulsing effects
- Glassmorphism design for cards
- Form validation with real-time error feedback
- Password strength indicator during registration
- Password visibility toggles
- Loading states and spinners
- Toast notifications for user actions
- Error popup notifications (5-second auto-dismiss)
- Color-coded task priority and status
- Overdue task indicators with bold styling
- Progress bars for task status visualization
- Delete confirmation modal
- Character counter for description field

### Data Management
- User-scoped data (each user sees only their tasks)
- MongoDB aggregation for statistics
- Compound indexes for query optimization
- Input sanitization and validation
- Error handling with descriptive messages

### Security Features
- JWT token with 7-day expiration
- Password hashing with bcrypt (10 salt rounds)
- Protected API routes with authentication middleware
- Environment variable management for sensitive data
- CORS configuration for cross-origin requests
- Input validation on both client and server


## Deployment

### Backend Deployment (Render)

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Select the `server` directory as the root directory
   - Build command: `npm install`
   - Start command: `npm start`

2. **Environment Variables to Add on Render:**
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database-name>
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   JWT_EXPIRE=7d
   ```

3. **Update CORS settings** in `server/index.js` to include your Vercel frontend URL

### Frontend Deployment (Vercel)

1. **Create a new Project on Vercel**
   - Connect your GitHub repository
   - Set the root directory to `client`
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Environment Variables to Add on Vercel:**
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

3. **Add vercel.json** (already included in client folder)
   - This file handles React Router rewrites for client-side routing

### Post-Deployment Steps

1. **Update MongoDB Network Access**
   - Add `0.0.0.0/0` to MongoDB Atlas IP whitelist for production

2. **Test Authentication Flow**
   - Register a new user
   - Login and verify JWT token storage
   - Test protected routes

3. **Verify API Connectivity**
   - Check browser console for CORS errors
   - Test all CRUD operations
   - Verify statistics endpoint


## Technology Stack Explanation

### Why MERN Stack?

**MongoDB** was chosen as the database for its flexibility with document-based storage, which suits the varying structure of task data (different categories, custom fields). The aggregation pipeline provides powerful real-time analytics for the statistics dashboard without requiring complex joins.

**Express.js** provides a lightweight, unopinionated framework that's perfect for building RESTful APIs. Its middleware architecture makes it easy to implement authentication, error handling, and request validation.

**React** was selected for the frontend due to its component-based architecture, which enables code reusability (e.g., TaskForm component used for both creating and editing tasks). The virtual DOM ensures efficient updates when tasks change frequently.

**Node.js** allows JavaScript to run on both client and server, reducing context switching and enabling code sharing between frontend and backend (e.g., validation rules).


## Challenges and Solutions

### Challenge 1: Optimizing Dashboard Statistics Performance

**Problem:** Initially, the dashboard statistics were calculated by fetching all tasks and filtering them on the client side. This approach caused:
- Long load times when users had hundreds of tasks
- Unnecessary data transfer (entire task collection sent to client)
- Browser memory issues with large datasets
- Poor user experience with visible lag

**Solution:** Implemented MongoDB Aggregation Pipeline on the server side (`GET /tasks/stats` endpoint). The aggregation pipeline uses the `$group` operator to calculate statistics directly in the database:

```javascript
const stats = await Task.aggregate([
  { $match: { user: req.user.id } },
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
```

The statistics endpoint now returns only the aggregated counts, which are then mapped to the dashboard's statistics cards (Total, Pending, In Progress, Completed).


### Challenge 2: Real-time Form Validation Without Performance Degradation

**Problem:** Implementing form validation on every keystroke caused:
- Input lag on slower devices
- React re-renders on every character typed
- Complex error state management across multiple fields
- Inconsistent validation logic between client and server

**Solution:** Implemented a hybrid validation approach:

1. **Debounced Validation**: Field-level errors only show after user stops typing or leaves the field
2. **Regex Patterns for Email**: Used `^[^\s@]+@[^\s@]+\.[^\s@]+$` for instant email format validation
3. **Conditional Error Clearing**: Errors automatically clear when user starts correcting the field
4. **Validation on Submit**: Final validation occurs before API call to prevent unnecessary requests
5. **Error State Object**: Single state object manages all field errors for better organization

```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: value });
  // Clear error when user starts typing
  if (errors[name]) {
    setErrors({ ...errors, [name]: '' });
  }
};
```

---