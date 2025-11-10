/**
 * API Configuration
 * Centralized API base URL management for frontend
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint (e.g., '/api/auth/login')
 * @returns Full URL with base URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Ensure endpoint starts with /api
  if (!cleanEndpoint.startsWith('/api')) {
    return `${API_BASE_URL}/api${cleanEndpoint}`;
  }
  
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Fetch wrapper that automatically uses the correct API base URL
 * @param endpoint - API endpoint (e.g., '/api/auth/login')
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = getApiUrl(endpoint);
  
  // Merge credentials and other default options
  const mergedOptions: RequestInit = {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  
  return fetch(url, mergedOptions);
};

export default {
  getApiUrl,
  apiFetch,
  API_BASE_URL,
};

