# Lawyer Zen - Separate Deployment Guide

This guide explains how to deploy the Lawyer Zen application with separate frontend and backend deployments.

## Project Structure

After separation, you have two independent projects:

```
lawyer-zen/
├── backend/                 # Backend API server
│   ├── src/
│   ├── server/
│   ├── package.json
│   ├── index.js
│   └── README.md
└── frontend/               # Frontend React application
    ├── src/
    ├── public/
    ├── package.json
    ├── vite.config.ts
    └── README.md
```

## Backend Deployment

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Environment variables configured

### Local Development
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `backend.env.example`:
   ```bash
   cp backend.env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/lawyer-zen
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:8080
   FRONTEND_URL=http://localhost:8080
   JWT_SECRET=your-super-secret-jwt-key
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Production Deployment

#### Option 1: Traditional Server
1. Set up a server with Node.js and MongoDB
2. Clone the backend repository
3. Install dependencies: `npm install`
4. Configure production environment variables
5. Start with PM2 or similar process manager:
   ```bash
   npm start
   ```

#### Option 2: Docker
1. Create a Dockerfile in the backend directory:
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. Build and run:
   ```bash
   docker build -t lawyer-zen-backend .
   docker run -p 5000:5000 --env-file .env lawyer-zen-backend
   ```

#### Option 3: Cloud Platforms
- **Heroku**: Deploy directly from Git repository
- **Railway**: Connect GitHub repository
- **DigitalOcean App Platform**: Deploy from source code
- **AWS Elastic Beanstalk**: Deploy Node.js application

### Environment Variables for Production
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lawyer-zen
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-super-secure-jwt-secret-key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

## Frontend Deployment

### Prerequisites
- Node.js (v16 or higher)
- Environment variables configured

### Local Development
1. Navigate to the frontend directory (root of the project):
   ```bash
   cd .
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `frontend.env.example`:
   ```bash
   cp frontend.env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_NODE_ENV=development
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Production Build
1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `dist/` directory

### Production Deployment

#### Option 1: Static Hosting
Deploy the `dist/` folder to any static hosting service:
- **Netlify**: Drag and drop the dist folder
- **Vercel**: Connect GitHub repository
- **GitHub Pages**: Deploy from GitHub Actions
- **AWS S3 + CloudFront**: Upload to S3 bucket

#### Option 2: Traditional Web Server
1. Copy the `dist/` folder to your web server
2. Configure your web server (Apache/Nginx) to serve the files
3. Set up proper routing for SPA (Single Page Application)

#### Option 3: Docker
1. Create a Dockerfile:
   ```dockerfile
   FROM node:16-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. Create nginx.conf for SPA routing:
   ```nginx
   events {
       worker_connections 1024;
   }
   http {
       include /etc/nginx/mime.types;
       default_type application/octet-stream;
       
       server {
           listen 80;
           root /usr/share/nginx/html;
           index index.html;
           
           location / {
               try_files $uri $uri/ /index.html;
           }
       }
   }
   ```

### Environment Variables for Production
```env
VITE_API_URL=https://your-backend-api-domain.com
VITE_NODE_ENV=production
```

## Deployment Checklist

### Backend Checklist
- [ ] MongoDB database is accessible
- [ ] Environment variables are configured
- [ ] CORS is configured for frontend domain
- [ ] JWT secret is secure and unique
- [ ] Email configuration is working (if using email features)
- [ ] File upload directory has proper permissions
- [ ] Health check endpoint is accessible: `GET /api/health`

### Frontend Checklist
- [ ] Environment variables are configured
- [ ] API URL points to the correct backend
- [ ] Build process completes successfully
- [ ] Static files are served correctly
- [ ] SPA routing is configured (if using client-side routing)
- [ ] HTTPS is configured (recommended for production)

## Testing the Deployment

### Backend Testing
1. Health check:
   ```bash
   curl https://your-backend-domain.com/api/health
   ```

2. Test API endpoints:
   ```bash
   curl -X POST https://your-backend-domain.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

### Frontend Testing
1. Open the frontend URL in a browser
2. Test user registration/login
3. Verify API calls are working
4. Test file uploads (if applicable)
5. Check that all routes work correctly

## Troubleshooting

### Common Issues

#### CORS Errors
- Ensure `CORS_ORIGIN` and `FRONTEND_URL` in backend match your frontend domain
- Check that the frontend is making requests to the correct backend URL

#### API Connection Issues
- Verify `VITE_API_URL` in frontend environment variables
- Check that the backend is running and accessible
- Ensure firewall/security groups allow connections

#### File Upload Issues
- Check file upload directory permissions
- Verify `UPLOAD_PATH` environment variable
- Ensure sufficient disk space

#### Authentication Issues
- Verify JWT secret is the same across deployments
- Check cookie settings for cross-domain authentication
- Ensure HTTPS is used in production for secure cookies

### Monitoring
- Set up logging for both frontend and backend
- Monitor API response times and error rates
- Set up alerts for service downtime
- Monitor database performance

## Security Considerations

### Backend Security
- Use HTTPS in production
- Implement rate limiting
- Validate all input data
- Use secure JWT secrets
- Implement proper error handling (don't expose sensitive information)

### Frontend Security
- Use HTTPS in production
- Implement Content Security Policy (CSP)
- Sanitize user inputs
- Use secure cookie settings
- Implement proper error handling

## Scaling Considerations

### Backend Scaling
- Use a load balancer for multiple backend instances
- Implement database connection pooling
- Use Redis for session storage (if needed)
- Consider microservices architecture for large applications

### Frontend Scaling
- Use CDN for static assets
- Implement caching strategies
- Consider server-side rendering for SEO
- Use lazy loading for better performance

## Support

For deployment issues or questions:
1. Check the individual README files in backend/ and frontend/ directories
2. Review the troubleshooting section above
3. Check application logs for error details
4. Verify environment variable configuration