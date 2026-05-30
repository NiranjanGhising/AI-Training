import { API_URL } from './config';
import type {
  Category,
  DashboardStats,
  Inventory,
  Item,
  ItemCreate,
  ItemUpdate,
  User,
} from './types';

const TOKEN_KEY = 'inventrack_token';

const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const clearTokenAndRedirect = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const buildHeaders = (auth: boolean, json: boolean): HeadersInit => {
  const headers: HeadersInit = {};
  if (json) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  let data: unknown = null;
  const contentType = response.headers.get('content-type');
  if (response.status !== 204) {
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { detail: text } : null;
    }
  }

  if (response.status === 401) {
    clearTokenAndRedirect();
  }

  if (!response.ok) {
    const detail =
      typeof data === 'object' && data && 'detail' in data
        ? String((data as { detail?: unknown }).detail)
        : 'Request failed';
    throw new Error(detail);
  }

  return data as T;
};

export const register = async (
  email: string,
  password: string,
  name?: string
): Promise<{ access_token: string; token_type: string }> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: buildHeaders(false, true),
    body: JSON.stringify({ email, password, name }),
  });
  return handleResponse(response);
};

export const login = async (
  email: string,
  password: string
): Promise<{ access_token: string; token_type: string }> => {
  const body = new URLSearchParams();
  body.set('username', email);
  body.set('password', password);
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      ...buildHeaders(false, false),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  return handleResponse(response);
};

export const getMe = async (): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: buildHeaders(true, false),
  });
  return handleResponse(response);
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_URL}/dashboard/stats`, {
    headers: buildHeaders(true, false),
  });
  return handleResponse(response);
};

export const getInventories = async (): Promise<Inventory[]> => {
  const response = await fetch(`${API_URL}/inventories`, {
    headers: buildHeaders(true, false),
  });
  return handleResponse(response);
};

export const createInventory = async (
  name: string,
  description?: string
): Promise<Inventory> => {
  const response = await fetch(`${API_URL}/inventories`, {
    method: 'POST',
    headers: buildHeaders(true, true),
    body: JSON.stringify({ name, description }),
  });
  return handleResponse(response);
};

export const updateInventory = async (
  id: string,
  name: string,
  description?: string
): Promise<Inventory> => {
  const response = await fetch(`${API_URL}/inventories/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true, true),
    body: JSON.stringify({ name, description }),
  });
  return handleResponse(response);
};

export const deleteInventory = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/inventories/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true, false),
  });
  await handleResponse(response);
};

export const getInventory = async (id: string): Promise<Inventory> => {
  const response = await fetch(`${API_URL}/inventories/${id}`, {
    headers: buildHeaders(true, false),
  });
  return handleResponse(response);
};

export const getCategories = async (invId: string): Promise<Category[]> => {
  const response = await fetch(`${API_URL}/inventories/${invId}/categories`, {
    headers: buildHeaders(true, false),
  });
  return handleResponse(response);
};

export const createCategory = async (
  invId: string,
  name: string,
  description?: string
): Promise<Category> => {
  const response = await fetch(`${API_URL}/inventories/${invId}/categories`, {
    method: 'POST',
    headers: buildHeaders(true, true),
    body: JSON.stringify({ name, description }),
  });
  return handleResponse(response);
};

export const updateCategory = async (
  invId: string,
  catId: string,
  name: string,
  description?: string
): Promise<Category> => {
  const response = await fetch(
    `${API_URL}/inventories/${invId}/categories/${catId}`,
    {
      method: 'PUT',
      headers: buildHeaders(true, true),
      body: JSON.stringify({ name, description }),
    }
  );
  return handleResponse(response);
};

export const deleteCategory = async (
  invId: string,
  catId: string
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/inventories/${invId}/categories/${catId}`,
    {
      method: 'DELETE',
      headers: buildHeaders(true, false),
    }
  );
  await handleResponse(response);
};

export const getItems = async (params?: {
  cat_id?: string;
  inv_id?: string;
}): Promise<Item[]> => {
  const query = new URLSearchParams();
  if (params?.cat_id) {
    query.set('cat_id', params.cat_id);
  }
  if (params?.inv_id) {
    query.set('inv_id', params.inv_id);
  }
  const queryString = query.toString();
  const response = await fetch(
    `${API_URL}/items${queryString ? `?${queryString}` : ''}`,
    {
      headers: buildHeaders(true, false),
    }
  );
  return handleResponse(response);
};

export const createItem = async (data: ItemCreate): Promise<Item> => {
  const response = await fetch(`${API_URL}/items`, {
    method: 'POST',
    headers: buildHeaders(true, true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateItem = async (id: string, data: ItemUpdate): Promise<Item> => {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true, true),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteItem = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/items/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true, false),
  });
  await handleResponse(response);
};
