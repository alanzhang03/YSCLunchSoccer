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
