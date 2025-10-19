// API configuration utility
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export const apiUrl = (path: string) => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

export const apiRequest = async (path: string, options: RequestInit = {}) => {
  const url = apiUrl(path);
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Remove Content-Type for FormData requests
  if (options.body instanceof FormData) {
    delete (defaultOptions.headers as any)['Content-Type'];
  }

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  return response;
};

// Helper functions for common API operations
export const apiGet = (path: string, options?: RequestInit) => 
  apiRequest(path, { method: 'GET', ...options });

export const apiPost = (path: string, data?: any, options?: RequestInit) => 
  apiRequest(path, { 
    method: 'POST', 
    body: data instanceof FormData ? data : JSON.stringify(data),
    ...options 
  });

export const apiPut = (path: string, data?: any, options?: RequestInit) => 
  apiRequest(path, { 
    method: 'PUT', 
    body: data instanceof FormData ? data : JSON.stringify(data),
    ...options 
  });

export const apiDelete = (path: string, options?: RequestInit) => 
  apiRequest(path, { method: 'DELETE', ...options });

// File URL helper
export const getFileUrl = (filePath: string) => {
  if (!filePath) return '';
  // If it's already a full URL, return as is
  if (filePath.startsWith('http')) return filePath;
  // Otherwise, construct the full URL
  return `${API_BASE_URL}${filePath.startsWith('/') ? filePath : '/' + filePath}`;
};


