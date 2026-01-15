const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const fetchWithCredentials = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

export async function signup(phoneNum, email, name, password, skill) {
  try {
    const response = await fetchWithCredentials(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({ phoneNum, email, name, password, skill }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function login(identifier, password, rememberMe = false) {
  try {
    const isEmail = identifier.includes('@');
    const body = isEmail
      ? { email: identifier, password, rememberMe }
      : { phoneNum: identifier, password, rememberMe };

    const response = await fetchWithCredentials(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function refreshToken() {
  try {
    const response = await fetchWithCredentials(
      `${API_BASE_URL}/auth/refresh`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetchWithCredentials(`${API_BASE_URL}/auth/me`);

    if (!response.ok) {
      if (response.status === 401) {
        const refreshResponse = await refreshToken();
        if (refreshResponse) {
          const retryResponse = await fetchWithCredentials(
            `${API_BASE_URL}/auth/me`
          );
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
        return null;
      }
      throw new Error('Failed to get current user');
    }

    return response.json();
  } catch (error) {
    return null;
  }
}

export async function logout() {
  try {
    const response = await fetchWithCredentials(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}

export async function requestPasswordReset(email) {
  try {
    const response = await fetchWithCredentials(
      `${API_BASE_URL}/auth/forgot-password`,
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to request password reset');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function resetPassword(token, newPassword) {
  try {
    const response = await fetchWithCredentials(
      `${API_BASE_URL}/auth/reset-password`,
      {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    throw error;
  }
}
