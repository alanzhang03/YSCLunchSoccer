import * as SecureStore from 'expo-secure-store';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function login(identifier: string, password: string) {
  try {
    const isEmail = identifier.includes('@');
    const body = isEmail
      ? { email: identifier, password }
      : { phoneNum: identifier, password };

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);

    return data;
  } catch (error) {
    throw error;
  }
}

export async function signup(
  name: string,
  email: string,
  phoneNum: string,
  password: string,
  skill: number,
) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phoneNum, password, skill }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    await SecureStore.setItemAsync('accessToken', data.accessToken);
    await SecureStore.setItemAsync('refreshToken', data.refreshToken);

    return data;
  } catch (error) {
    throw error;
  }
}

export async function getMe() {
  try {
    const token = await SecureStore.getItemAsync('accessToken');

    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    return response.json();
  } catch {
    return null;
  }
}

export async function logout() {
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
}
