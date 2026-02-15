const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const authService = {
  bloggerLogin: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/blogger/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, password }).toString(),
      credentials: 'include',
    });
    return response;
  },

  bloggerLogout: async () => {
    const response = await fetch(`${API_BASE_URL}/blogger/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return response;
  },
};
