const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const fetchWithCredentials = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
};

export async function signup(phoneNum, email, name, password, skill) {
  try {
    const response = await fetchWithCredentials(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      body: JSON.stringify({ phoneNum, email, name, password, skill }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Signup failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function login(phoneNum, password) {
  try {
    const response = await fetchWithCredentials(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ phoneNum, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetchWithCredentials(`${API_BASE_URL}/auth/me`);

    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error("Failed to get current user");
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

export async function logout() {
  try {
    const response = await fetchWithCredentials(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}
