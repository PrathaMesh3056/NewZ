const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

export async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      
      if (response.status >= 500 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, options, retries - 1);
      }
      
      throw new ApiError(
        errorData.message || 'An error occurred',
        response.status,
        errorData
      );
    }

    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    
    throw error;
  }
}

export function createApiClient(baseURL = '') {
  return {
    get: (endpoint, options = {}) => 
      fetchWithRetry(`${baseURL}${endpoint}`, { ...options, method: 'GET' }),
      
    post: (endpoint, data, options = {}) =>
      fetchWithRetry(`${baseURL}${endpoint}`, {
        ...options,
        method: 'POST',
        body: JSON.stringify(data),
      }),
      
    put: (endpoint, data, options = {}) =>
      fetchWithRetry(`${baseURL}${endpoint}`, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(data),
      }),
      
    delete: (endpoint, options = {}) =>
      fetchWithRetry(`${baseURL}${endpoint}`, { ...options, method: 'DELETE' }),
  };
}

export const api = createApiClient(import.meta.env.VITE_API_BASE || '/api');
