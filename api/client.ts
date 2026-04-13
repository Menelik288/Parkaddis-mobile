import * as SecureStore from 'expo-secure-store';

export let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

const BASE_URL = 'https://park-addis.onrender.com/api';

/**
 * Enhanced fetch wrapper that mimics the Axios interface
 * to minimize refactoring in service files.
 */
async function request(method: string, endpoint: string, data?: any, params?: any) {
  const sessionId = await SecureStore.getItemAsync('sessionId');
  
  // Construct URL with query parameters if present
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) url += `?${queryString}`;
  }

  // Add a 30-second timeout for slow cold starts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId ? { Authorization: `Bearer ${sessionId}` } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle common status codes
    if (response.status === 401) {
      console.warn('Unauthorized request - session may have expired');
      if (onUnauthorized) {
        onUnauthorized();
      }
    }

    // Parse response body
    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      let message = responseData.message || `API Request failed with status ${response.status}`;
      
      // Specifically handle 502 / intermittent gateway issues (Render cold starts)
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        message = 'The backend (Render) is temporarily busy or cold-starting. Please try again in 10-15 seconds.';
      }

      // Create an error object that matches AxiosError structure for compatibility
      const error = new Error(message);
      (error as any).response = {
        status: response.status,
        data: responseData
      };
      (error as any).isAxiosError = true; // Still useful for some guards
      throw error;
    }

    return { 
      data: responseData,
      status: response.status,
      ok: response.ok 
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Our servers are taking a bit longer to wake up. Please try again in a moment.');
    }
    throw error;
  }
}

const apiClient = {
  get: <T>(url: string, config?: { params?: any }) => 
    request('GET', url, null, config?.params) as Promise<{ data: T; status: number; ok: boolean }>,
  
  post: <T>(url: string, data?: any) => 
    request('POST', url, data) as Promise<{ data: T; status: number; ok: boolean }>,
  
  put: <T>(url: string, data?: any) => 
    request('PUT', url, data) as Promise<{ data: T; status: number; ok: boolean }>,
  
  delete: <T>(url: string) => 
    request('DELETE', url) as Promise<{ data: T; status: number; ok: boolean }>,
};

export default apiClient;
