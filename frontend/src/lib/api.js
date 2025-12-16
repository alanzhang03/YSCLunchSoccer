const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function getSessions() {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }
  return response.json();
}

export async function getSessionsByUser() {
  const response = await fetch(`${API_BASE_URL}/sessions/sessionsByUser`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch sessions');
  }
  return response.json();
}

export async function attendSession(sessionId, status) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/attend`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to RSVP');
  }

  return response.json();
}

export async function getSessionById(sessionId) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch session');
  }
  return response.json();
}

export async function getSessionAttendances(sessionId) {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/attendances`,
    {
      credentials: 'include',
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch attendances');
  }
  return response.json();
}

export async function getMessages(sessionId) {
  const response = await fetch(`${API_BASE_URL}/messages/${sessionId}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch messages');
  }

  return response.json();
}

export async function sendMessage(sessionId, content) {
  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: sessionId,
      content: content,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send message');
  }

  return response.json();
}
