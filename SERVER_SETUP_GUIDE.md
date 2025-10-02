# Server Setup Guide - Resolve API Connection Errors

## Problem
The frontend is getting `ECONNREFUSED` errors because the backend server is not running properly. This is likely due to MongoDB not being installed or configured.

## Solution Options

### Option 1: Install MongoDB Locally (Recommended for Development)

1. **Download MongoDB Community Server**:
   - Go to: https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server for Windows
   - Install with default settings

2. **Start MongoDB Service**:
   ```powershell
   # Start MongoDB service (run as Administrator)
   net start MongoDB
   ```

3. **Start the Backend Server**:
   ```powershell
   cd "F:\Internship Works\Lawer Zen\lawyer-zen\server"
   $env:NODE_ENV="development"
   $env:PORT="5000"
   $env:MONGODB_URI="mongodb://localhost:27017/lawyer_zen"
   $env:JWT_SECRET="your-super-secret-jwt-key"
   $env:CORS_ORIGIN="http://localhost:8080"
   node index.js
   ```

### Option 2: Use MongoDB Atlas (Cloud Database)

1. **Create MongoDB Atlas Account**:
   - Go to: https://www.mongodb.com/atlas
   - Create free account and cluster

2. **Get Connection String**:
   - In Atlas dashboard, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string (replace `<password>` with your actual password)

3. **Start Server with Atlas**:
   ```powershell
   cd "F:\Internship Works\Lawer Zen\lawyer-zen\server"
   $env:NODE_ENV="development"
   $env:PORT="5000"
   $env:MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lawyer_zen?retryWrites=true&w=majority"
   $env:JWT_SECRET="your-super-secret-jwt-key"
   $env:CORS_ORIGIN="http://localhost:8080"
   node index.js
   ```

### Option 3: Quick Local Setup (If you have Docker)

```powershell
# Start MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Then start the server
cd "F:\Internship Works\Lawer Zen\lawyer-zen\server"
$env:MONGODB_URI="mongodb://localhost:27017/lawyer_zen"
node index.js
```

## Verification Steps

1. **Check if server is running**:
   ```powershell
   curl http://localhost:5000/api/health
   ```
   Should return: `{"ok":true,"service":"lawyer-zen-api"}`

2. **Check if frontend connects**:
   - Go to http://localhost:8080
   - Dashboard should load without connection errors
   - Revenue, activities, and notifications should display

## Environment Variables Needed

Create a `.env` file in the server directory with:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lawyer_zen
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:8080
```

## Common Issues & Solutions

### Issue 1: Port 5000 already in use
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace XXXX with actual PID)
taskkill /PID XXXX /F
```

### Issue 2: MongoDB connection failed
- Make sure MongoDB service is running
- Check the connection string is correct
- For Atlas, ensure IP is whitelisted (0.0.0.0/0 for development)

### Issue 3: CORS errors
- Ensure `CORS_ORIGIN=http://localhost:8080` is set
- Frontend should be running on port 8080

## Quick Start Commands

**Terminal 1 (Backend)**:
```powershell
cd "F:\Internship Works\Lawer Zen\lawyer-zen\server"
$env:MONGODB_URI="mongodb://localhost:27017/lawyer_zen"
$env:JWT_SECRET="your-jwt-secret"
$env:CORS_ORIGIN="http://localhost:8080"
node index.js
```

**Terminal 2 (Frontend)**:
```powershell
cd "F:\Internship Works\Lawer Zen\lawyer-zen"
npm run dev
```

Once both are running:
- Frontend: http://localhost:8080
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

The dashboard should now work without connection errors!
