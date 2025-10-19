# LawGPT Backend API

This is the backend API server for the LawGPT application. It provides RESTful APIs for managing legal cases, clients, documents, and other legal practice management features.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Case Management**: Create, update, and manage legal cases
- **Client Management**: Manage client information and relationships
- **Document Management**: Upload, organize, and manage legal documents
- **Time Tracking**: Track billable hours and time entries
- **Invoice Management**: Generate and manage invoices
- **Hearing Management**: Schedule and track court hearings
- **Alert System**: Notifications and reminders
- **Legal Research**: Access to legal sections and research materials

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/lawyer-zen
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:8080
   FRONTEND_URL=http://localhost:8080
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Email Configuration (for password reset and notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   
   # File Upload Configuration
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./server/uploads
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Legal Sections
```bash
npm run seed:legal
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/forgot` - Request password reset
- `POST /api/auth/reset` - Reset password

### Cases
- `GET /api/cases` - Get all cases
- `POST /api/cases` - Create new case
- `GET /api/cases/:id` - Get case by ID
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get client by ID
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Documents
- `GET /api/documents` - Get all documents
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents/folders` - Get document folders
- `POST /api/documents/folders` - Create folder
- `DELETE /api/documents/:id` - Delete document

### Time Entries
- `GET /api/time-entries` - Get all time entries
- `POST /api/time-entries` - Create time entry
- `PUT /api/time-entries/:id` - Update time entry
- `DELETE /api/time-entries/:id` - Delete time entry

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `POST /api/invoices/:id/send` - Send invoice

### Hearings
- `GET /api/hearings` - Get all hearings
- `POST /api/hearings` - Create hearing
- `PUT /api/hearings/:id` - Update hearing
- `DELETE /api/hearings/:id` - Delete hearing

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activity` - Get recent activity
- `GET /api/dashboard/notifications` - Get notifications

### Legal Sections
- `GET /api/legal-sections` - Get legal sections
- `GET /api/legal-sections/search` - Search legal sections

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create alert
- `PUT /api/alerts/:id/read` - Mark alert as read
- `DELETE /api/alerts/:id` - Delete alert

## File Uploads

The server handles file uploads and serves them at `/uploads/*`. Supported file types include:
- Documents: PDF, DOC, DOCX, TXT
- Images: JPG, JPEG, PNG, GIF
- Audio: MP3, WAV
- Video: MP4, AVI
- Spreadsheets: XLSX, CSV

## CORS Configuration

The server is configured to accept requests from:
- `http://localhost:8080` (default frontend)
- `http://localhost:3000` (alternative frontend)
- `http://localhost:5173` (Vite dev server)
- Environment variable `FRONTEND_URL`
- Environment variable `CORS_ORIGIN`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/lawyer-zen` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:8080` |
| `FRONTEND_URL` | Frontend URL for CORS | - |
| `JWT_SECRET` | JWT signing secret | - |
| `EMAIL_HOST` | SMTP host | - |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |
| `EMAIL_FROM` | From email address | - |

## Deployment

### Local Development
1. Start MongoDB
2. Run `npm run dev`
3. Server will start on `http://localhost:5000`

### Production Deployment
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT secret
4. Configure email settings
5. Run `npm start`

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## Security

- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- CORS is configured to allow specific origins
- File uploads are validated and limited in size
- Input validation is performed on all endpoints

## Monitoring

- Health check endpoint: `GET /api/health`
- Request logging with Morgan
- Error handling and logging

## Support

For issues and questions, please check the main project documentation or create an issue in the repository.


