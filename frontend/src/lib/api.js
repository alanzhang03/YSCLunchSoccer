const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export async function getSessions() {
  const response = await fetch(`${API_BASE_URL}/sessions`);
  if (!response.ok) {
    throw new Error("Failed to fetch sessions");
  }
  return response.json();
}

export async function attendSession(sessionId, status) {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions/${sessionId}/attend`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to RSVP");
  }

  return response.json();
}

export async function getSessionAttendances(sessionId) {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions/${sessionId}/attendances`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch attendances");
  }
  return response.json();
}
