const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export async function getSessions() {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }
  return response.json();
}

export async function attendSession(sessionId, status) {
  const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/attend`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to RSVP");
  }

  return response.json();
}

export async function getSessionAttendances(sessionId) {
  const response = await fetch(
    `${API_BASE_URL}/sessions/${sessionId}/attendances`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch attendances");
  }
  return response.json();
}
