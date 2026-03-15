const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function getSessionsByUser() {
  const response = await fetch(`${API_BASE_URL}/sessions/sessionsByUser`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!response.ok) throw new Error('Failed to fetch sessions');
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
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, phone, skill }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update profile info');
  }

  return response.json();
}
