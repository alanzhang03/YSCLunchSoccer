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

export async function createSession(sessionData) {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create session');
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

export async function attendMultipleSessions(sessionIds, status) {
  const response = await fetch(`${API_BASE_URL}/sessions/rsvp-multiple`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionIds, status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to RSVP to multiple sessions');
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
    },
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

export async function deleteSession(sessionId) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/delete`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete session');
  }

  return response.json();
}

export async function deleteAttendances(sessionId, attendanceIds) {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/attendances/delete`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attendanceIds }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete attendances');
  }

  return response.json();
}

export async function updateShowTeams(sessionId, showTeams) {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/showTeams`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ showTeams }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update showTeams');
  }

  return response.json();
}

export async function updateTeamsLocked(sessionId, teamsLocked) {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/teamsLocked`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teamsLocked }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update teamsLocked');
  }

  return response.json();
}

export async function lockTeams(sessionId, teams, numOfTeams, matchups) {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/lockTeams`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        teams,
        numOfTeams,
        ...(matchups ? { matchups } : {}),
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to lock teams');
  }

  return response.json();
}

export async function createCheckoutSession(priceId, sessionId, quantity = 1) {
  const response = await fetch(`${API_BASE_URL}/checkout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId, sessionId, quantity }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create checkout session');
  }

  return response.json();
}

export async function getSessionPaymentStatus(sessionId) {
  const response = await fetch(
    `${API_BASE_URL}/checkout/session/${sessionId}/status`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch payment status');
  }

  return response.json();
}

export async function updateUserPaymentStatus(sessionId, userId, hasPaid) {
  const response = await fetch(
    `${API_BASE_URL}/checkout/session/${sessionId}/user/${userId}/payment-status`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hasPaid }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update payment status');
  }

  return response.json();
}

export async function getAllSessionPaymentStatuses(sessionId) {
  const response = await fetch(
    `${API_BASE_URL}/checkout/session/${sessionId}/all-statuses`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch all payment statuses');
  }

  return response.json();
}

export async function updateSessionFieldLocation(sessionId, fieldLocation) {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/fieldLocation`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fieldLocation }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update field location');
  }

  return response.json();
}

export async function updateSessionTime(sessionId, startTime, endTime) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/time`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ startTime, endTime }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update session time');
  }

  return response.json();
}

export async function sendEmail({ name, email, message }) {
  const response = await fetch(`${API_BASE_URL}/auth/contact`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, message }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send message');
  }

  return response.json();
}

export async function adjustPersonalInfo({
  name,
  email,
  phone,
  skill,
  smsOptIn,
}) {
  const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, phone, skill, smsOptIn }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update profile info');
  }

  return response.json();
}

export async function fetchAllUsers() {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch users');
  }

  return response.json();
}

export async function updateUser(userId, data) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update user');
  }

  return response.json();
}

export async function deleteUser(userId) {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to delete user');
  }

  return response.json();
}

export async function sendSmsToAttendees(sessionId, teams, matchups) {
  const response = await fetch(`${API_BASE_URL}/sms/${sessionId}/send`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teams, ...(matchups?.length ? { matchups } : {}) }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send SMS');
  }

  return response.json();
}

export async function sendSmsAfterDeleteSession(sessionId) {
  const response = await fetch(
    `${API_BASE_URL}/sms/${sessionId}/notify-deletion`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to send SMS');
  }

  return response.json();
}

export async function getDisclaimerInfo() {
  const response = await fetch(`${API_BASE_URL}/disclaimer`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch disclaimer');
  }

  return response.json();
}

export async function setDisclaimerInfo(enabled, message) {
  const response = await fetch(`${API_BASE_URL}/disclaimer`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled, message }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update disclaimer');
  }

  return response.json();
}
