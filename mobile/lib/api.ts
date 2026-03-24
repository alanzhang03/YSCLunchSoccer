import * as SecureStore from 'expo-secure-store';
import { logout } from '@/lib/auth';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

async function authHeaders(
  extra?: Record<string, string>,
): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync('accessToken');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Cache-Control': 'no-cache',
    ...extra,
  };
}

async function authedFetch(url: string, options: RequestInit): Promise<Response> {
  const response = await fetch(url, options);
  if (response.status === 401) {
    await logout();
  }
  return response;
}

export async function getSessions() {
  const response = await authedFetch(`${API_BASE_URL}/sessions`, {
    method: 'GET',
    headers: await authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
}

export async function getSessionById(sessionId: string) {
  const response = await authedFetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'GET',
    headers: await authHeaders(),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch session info for session`)
  }
  return response.json();
}

export async function getSessionsByUser() {
  const response = await authedFetch(`${API_BASE_URL}/sessions/sessionsByUser`, {
    method: 'GET',
    headers: await authHeaders(),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }
  return response.json();
}

export async function attendSession(
  sessionId: string,
  status: 'yes' | 'no' | 'maybe',
) {
  const response = await authedFetch(`${API_BASE_URL}/sessions/${sessionId}/attend`, {
    method: 'POST',
    headers: await authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update attendance');
  return response.json();
}

export async function adjustPersonalInfo(
  name: string,
  email: string,
  phone: string,
  skill: number,
) {
  const response = await authedFetch(`${API_BASE_URL}/auth/update-profile`, {
    method: 'PUT',
    headers: await authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name, email, phone, skill }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update profile info');
  }
  return response.json();
}
