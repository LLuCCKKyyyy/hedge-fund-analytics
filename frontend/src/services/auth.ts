import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export const authService = {
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);
      
      const response = await axios.post<AuthResponse>(`${API_URL}/token`, formData);
      const data = response.data;
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      return data;
    } catch (error) {
      throw new Error('Login failed');
    }
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    try {
      const response = await axios.post<User>(`${API_URL}/register`, credentials);
      return response.data;
    } catch (error) {
      throw new Error('Registration failed');
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get<User>(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to get current user');
    }
  },

  logout(): void {
    localStorage.removeItem('token');
  }
};
