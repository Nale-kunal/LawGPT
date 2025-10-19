# LawGPT Frontend

This is the frontend React application for the LawGPT AI-powered legal practice management system. It provides a modern, responsive interface for managing legal cases, clients, documents, and other legal practice operations.

## Features

- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Case Management**: Create, update, and manage legal cases with detailed information
- **Client Management**: Comprehensive client information and relationship management
- **Document Management**: Upload, organize, and manage legal documents with folder structure
- **Time Tracking**: Track billable hours and time entries for accurate billing
- **Invoice Management**: Generate, manage, and send invoices to clients
- **Hearing Management**: Schedule and track court hearings and appointments
- **Alert System**: Notifications and reminders for important dates and tasks
- **Legal Research**: Access to legal sections and research materials
- **Dashboard**: Comprehensive overview of practice statistics and recent activity
- **Authentication**: Secure user authentication and authorization

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API server running (see backend README)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lawyer-zen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp frontend.env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_NODE_ENV=development
   ```

## Development

### Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |
| `VITE_NODE_ENV` | Environment mode | `development` |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   └── ...             # Feature-specific components
├── contexts/           # React contexts for state management
│   ├── AuthContext.tsx # Authentication context
│   ├── LegalDataContext.tsx # Legal data management
│   └── ThemeContext.tsx # Theme management
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and configurations
│   ├── api.ts          # API configuration and utilities
│   └── utils.ts        # General utilities
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Cases.tsx       # Case management
│   ├── Clients.tsx     # Client management
│   ├── Documents.tsx   # Document management
│   ├── Calendar.tsx    # Calendar and hearings
│   ├── Billing.tsx     # Invoicing and billing
│   ├── LegalResearch.tsx # Legal research
│   ├── Settings.tsx    # User settings
│   ├── Login.tsx       # Authentication
│   └── ...             # Other pages
└── main.tsx           # Application entry point
```

## Key Technologies

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality UI component library
- **React Router**: Client-side routing
- **React Hook Form**: Form handling and validation
- **Zod**: Schema validation
- **Lucide React**: Beautiful icons
- **Recharts**: Chart library for data visualization
- **Sonner**: Toast notifications

## API Integration

The frontend communicates with the backend API through the `src/lib/api.ts` utility:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

// GET request
const response = await apiGet('api/cases');

// POST request
const response = await apiPost('api/cases', caseData);

// PUT request
const response = await apiPut('api/cases/123', updatedData);

// DELETE request
const response = await apiDelete('api/cases/123');
```

## Authentication

The application uses JWT-based authentication with HTTP-only cookies for security:

- Login/Register forms with validation
- Automatic token refresh
- Protected routes
- User session management
- Password reset functionality

## State Management

State is managed using React Context API:

- **AuthContext**: User authentication state
- **LegalDataContext**: Legal data (cases, clients, documents, etc.)
- **ThemeContext**: Application theme (light/dark mode)

## Styling

The application uses Tailwind CSS with a custom design system:

- Consistent color palette
- Responsive design patterns
- Dark/light theme support
- Accessible components
- Modern UI patterns

## File Upload

Document upload functionality includes:

- Multiple file selection
- Drag and drop support
- File type validation
- Progress indicators
- Folder organization
- File preview and download

## Responsive Design

The application is fully responsive and works on:

- Desktop computers (1920px+)
- Laptops (1024px - 1919px)
- Tablets (768px - 1023px)
- Mobile phones (320px - 767px)

## Performance Optimizations

- Code splitting with React.lazy()
- Image optimization
- Bundle size optimization
- Efficient re-rendering with React.memo()
- Optimized API calls with proper caching

## Security Features

- XSS protection
- CSRF protection via same-site cookies
- Input validation and sanitization
- Secure authentication flow
- Environment variable protection

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Deployment

See the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

### Quick Deployment Options

1. **Netlify**: Connect GitHub repository and deploy automatically
2. **Vercel**: Deploy with zero configuration
3. **GitHub Pages**: Deploy static build to GitHub Pages
4. **AWS S3 + CloudFront**: Upload build to S3 bucket

## Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint rules
- Use Prettier for code formatting
- Write meaningful commit messages

### Component Guidelines
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Implement proper error boundaries

### API Integration
- Use the centralized API utility functions
- Handle loading and error states
- Implement proper error handling
- Use TypeScript for API responses

## Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review the backend README for API documentation
3. Check the troubleshooting section
4. Create an issue in the repository

## License

This project is licensed under the MIT License - see the LICENSE file for details.