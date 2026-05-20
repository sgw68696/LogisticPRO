import { APP_CONFIG } from '@/config/appConfig';

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: string[];
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function buildHeaders(extraHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      message: data?.message || 'An unexpected error occurred',
      errors: data?.errors || [],
    };
  }

  return {
    success: true,
    message: data?.message || 'Success',
    data: data?.data ?? data,
    meta: data?.meta,
  };
}

export const apiClient = {
  async get<T>(url: string, params?: Record<string, string | number | undefined>): Promise<ApiResponse<T>> {
    const query = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        ).toString()
      : '';

    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${url}${query}`, {
      method: 'GET',
      headers: buildHeaders(),
    });

    return parseResponse<T>(response);
  },

  async post<T>(url: string, body?: Record<string, any>): Promise<ApiResponse<T>> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return parseResponse<T>(response);
  },

  async put<T>(url: string, body?: Record<string, any>): Promise<ApiResponse<T>> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return parseResponse<T>(response);
  },

  async patch<T>(url: string, body?: Record<string, any>): Promise<ApiResponse<T>> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    return parseResponse<T>(response);
  },

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: buildHeaders(),
    });

    return parseResponse<T>(response);
  },
};
