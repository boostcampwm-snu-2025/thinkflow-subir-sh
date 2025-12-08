import { API_BASE_URL } from '../../app/config';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta: any;
  message: string | null;
}

export interface ApiFail {
  success: false;
  data: null;
  meta: any;
  message: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFail;

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    // 204 No Content면 여기서 바로 종료
    if (res.status === 204) {
      return undefined as T;
    }
    throw new Error(`HTTP ${res.status}`);
  }

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'API Error');
  }

  return json.data;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export function apiPost<T, Body = unknown>(
  path: string,
  body: Body,
): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function apiPatch<T, Body = unknown>(
  path: string,
  body: Body,
): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function apiDelete<T = void>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}