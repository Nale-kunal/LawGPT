# Frontend - Lawyer Zen

React + TypeScript + Vite frontend for the Lawyer Zen application.

## Features

- Modern React 18 with TypeScript
- Vite for fast development and building
- shadcn/ui component library
- Tailwind CSS for styling
- React Router for navigation
- JWT authentication with HTTP-only cookies

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

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

Edit `.env` and update the API URL:

```env
VITE_API_URL=http://localhost:5000
```

**Note:** In production, update this to your deployed backend URL (e.g., `https://api.yourdomain.com`).

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:8080` (or the next available port).

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   │   ├── ui/        # shadcn/ui components
│   │   └── layout/    # Layout components
│   ├── contexts/      # React contexts (Auth, Theme, etc.)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and API config
│   ├── pages/         # Page components
│   └── main.tsx       # Application entry point
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```

## API Configuration

The frontend uses an environment variable (`VITE_API_URL`) to determine the backend API URL. This is configured in `src/lib/api.ts`.

All API calls automatically use this base URL, allowing the frontend to connect to different backend instances (development, staging, production) without code changes.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

**Important:** Vite environment variables must be prefixed with `VITE_` to be accessible in the browser.

## Development Notes

- The frontend runs independently and communicates with the backend via HTTP requests
- Authentication uses HTTP-only cookies set by the backend
- All API requests include credentials to ensure cookies are sent
- The frontend does not proxy API requests in production (unlike development with Vite proxy)

## Building for Production

1. Set `VITE_API_URL` in your `.env` file to your production backend URL
2. Run `npm run build`
3. Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, etc.)

## Troubleshooting

### API Connection Issues

- Verify `VITE_API_URL` in `.env` matches your backend URL
- Check that the backend is running and accessible
- Ensure CORS is configured correctly on the backend

### Build Errors

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires v18+)
- Verify all environment variables are set correctly

### Authentication Issues

- Clear browser cookies and localStorage
- Verify backend authentication endpoints are working
- Check browser console for CORS errors

