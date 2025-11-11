# Backend API - Lawyer Zen

Express.js backend API for the Lawyer Zen application.

## Features

- RESTful API with Express.js
- MongoDB database with Mongoose
- JWT authentication
- File upload handling with Multer
- CORS support for cross-origin requests

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment variables:**

Copy the `env.example` file to `.env`:

```bash
cp env.example .env
```

Edit `.env` and update the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/lawyer_zen
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:8080
NODE_ENV=development
```

3. **Create uploads directory:**

The uploads directory will be automatically created when you start the server, but you can create it manually:

```bash
mkdir uploads
```

## Running the Server

### Development Mode

```bash
npm run dev
```

This will start the server with auto-reload on file changes.

### Production Mode

```bash
npm start
```

The server will run on the port specified in your `.env` file (default: 5000).

## API Endpoints

All API endpoints are prefixed with `/api`:

- `/api/health` - Health check endpoint
- `/api/auth/*` - Authentication routes
- `/api/cases/*` - Case management
- `/api/clients/*` - Client management
- `/api/documents/*` - Document management
- `/api/hearings/*` - Hearing management
- `/api/invoices/*` - Invoice management
- `/api/alerts/*` - Alert management
- `/api/time-entries/*` - Time tracking
- `/api/legal-sections/*` - Legal research
- `/api/dashboard/*` - Dashboard data

## Database

The application uses MongoDB. Make sure MongoDB is running before starting the server.

### Seed Legal Sections (Optional)

```bash
npm run seed:legal
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/lawyer_zen` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `CORS_ORIGIN` | Frontend URL for CORS | `http://localhost:8080` |
| `NODE_ENV` | Environment (development/production) | `development` |

## File Uploads

Uploaded files are stored in the `uploads/` directory in the backend root. The directory is automatically created on first upload.

Files are served at the `/uploads` endpoint.

## CORS Configuration

The backend supports CORS for the frontend URL specified in `CORS_ORIGIN`. In production, update this to match your deployed frontend URL.

For multiple origins, you can provide a comma-separated list:
```
CORS_ORIGIN=http://localhost:8080,https://your-frontend-domain.com
```

## Authentication

The API uses JWT tokens stored in HTTP-only cookies. All protected routes require a valid authentication token.

## Deployment

1. Set `NODE_ENV=production` in your `.env` file
2. Update `CORS_ORIGIN` to your production frontend URL
3. Use a strong `JWT_SECRET` (generate with: `openssl rand -base64 32`)
4. Ensure MongoDB connection string is correct for your production database
5. Run `npm start` or use a process manager like PM2

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check the `MONGODB_URI` in your `.env` file
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change the `PORT` in your `.env` file
- Or kill the process using the port

### CORS Errors
- Verify `CORS_ORIGIN` matches your frontend URL exactly
- Check that credentials are included in frontend requests

