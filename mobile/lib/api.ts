import * as SecureStore from 'expo-secure-store';

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

export async function getSessions() {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'GET',
    headers: await authHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
}

export async function getSessionsByUser() {
  const response = await fetch(`${API_BASE_URL}/sessions/sessionsByUser`, {
    method: 'GET',
    headers: await authHeaders(),
  });
  if (!response.ok) {
    console.log('getSessionsByUser status:', response.status);
    throw new Error('Failed to fetch sessions');
  }
  return response.json();
}

export async function attendSession(
  sessionId: string,
  status: 'yes' | 'no' | 'maybe',
) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/attend`, {
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
  const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
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
