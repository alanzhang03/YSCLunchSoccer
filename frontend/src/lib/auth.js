export async function signup(phoneNum, email, name, password) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup`, {
            method: "POST",
            body: JSON.stringify({ phoneNum, email, name, password }),
        });
        return response.json();
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    }
}

export async function login(phoneNum, password) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    method: "POST",
    body: JSON.stringify({ phoneNum, password }),
    });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }
    return response.json();
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
}
