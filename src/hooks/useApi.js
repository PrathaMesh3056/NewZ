import { useState, useCallback } from 'react';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (err) {
      console.error('API request failed:', err);
      setError(err.message || 'Failed to process request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, options = {}) => 
    request(url, { ...options, method: 'GET' }), 
    [request]
  );

  const post = useCallback((url, data, options = {}) => 
    request(url, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data),
    }), 
    [request]
  );

  return {
    loading,
    error,
    get,
    post,
  };
};

export { useApi };