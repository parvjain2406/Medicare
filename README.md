# MediCare - Hospital Management System

A production-ready, full-stack MERN application for hospital management with complete authentication system.

## 📁 Project Structure

```
medicare/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── authController.js  # Auth logic (register, login, getMe)
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification
│   │   └── errorHandler.js    # Centralized error handling
│   ├── models/
│   │   └── User.js            # User schema with bcrypt
│   ├── routes/
│   │   └── auth.js            # Auth routes
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Express entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite + Axios + React Router DOM
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs with 12 salt rounds
- **State Management**: React Context API

## ⚙️ Environment Configuration

### Backend `.env` file (already created)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/medicare
JWT_SECRET=medicare_super_secret_jwt_key_2024_hospital_management_system
JWT_EXPIRE=7d
```

**Important**: Update `MONGO_URI` if using MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medicare
```

## 🚀 Run Instructions

### Prerequisites
1. Node.js (v18 or higher)
2. MongoDB (local or Atlas)

### Step 1: Start MongoDB
Make sure MongoDB is running locally, or use MongoDB Atlas.

### Step 2: Start Backend Server
```bash
cd d:\medicare\backend
npm run dev
```
Expected output:
```
╔══════════════════════════════════════════════════════╗
║           MediCare Backend Server                    ║
╠══════════════════════════════════════════════════════╣
║  Status:      Running                                ║
║  Port:        5000                                   ║
║  Environment: development                            ║
║  Health:      http://localhost:5000/api/health       ║
╚══════════════════════════════════════════════════════╝
MongoDB Connected: localhost
```

### Step 3: Start Frontend Dev Server
Open a new terminal:
```bash
cd d:\medicare\frontend
npm run dev
```
Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Step 4: Access Application
Open browser: **http://localhost:5173**

## 🔐 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | Health check | No |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Register Request
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "1234567890",  // optional
  "password": "password123"
}
```

### Login Request
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

## ✅ Testing Checklist

### 1. Backend Health Check
- [ ] Navigate to http://localhost:5000/api/health
- [ ] Should return: `{"success":true,"status":"OK","message":"Server is running"}`

### 2. Registration Flow
- [ ] Navigate to http://localhost:5173/register
- [ ] Fill in: Name, Email, Password
- [ ] Click "Create Account"
- [ ] Should redirect to home page with user info displayed

### 3. Duplicate Email Test
- [ ] Try registering with same email
- [ ] Should show error: "User already exists with this email"

### 4. Login Flow
- [ ] Logout and navigate to /login
- [ ] Enter registered email and password
- [ ] Should redirect to home page

### 5. Wrong Password Test
- [ ] Enter wrong password
- [ ] Should show error: "Invalid credentials"

### 6. Token Persistence
- [ ] After login, refresh the page (F5)
- [ ] Should still be logged in with user data visible

### 7. Protected Routes
- [ ] Clear localStorage (DevTools → Application → Local Storage → Clear)
- [ ] Navigate to http://localhost:5173/
- [ ] Should redirect to /login

### 8. Logout
- [ ] Click "Logout" button
- [ ] Should clear token and redirect to login

## 🔒 Security Features

- ✅ Password hashing with bcryptjs (12 salt rounds)
- ✅ JWT tokens with configurable expiry
- ✅ JWT secret from environment variables
- ✅ Passwords excluded from API responses (`select: false`)
- ✅ CORS configured for development
- ✅ Proper HTTP status codes
- ✅ Centralized error handling
- ✅ Input validation on both frontend and backend

## 📝 User Schema

```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String },  // optional
  password: { type: String, required: true, select: false },
  role: { type: String, default: "patient" },
  createdAt: { type: Date, default: Date.now }
}
```

## 🎨 UI Features

- Modern gradient background
- Responsive design (mobile-friendly)
- Real-time form validation
- Loading states with spinners
- Error messages with animations
- Clean card-based layouts
- Premium styling with CSS variables
