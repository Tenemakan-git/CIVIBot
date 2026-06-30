import { create } from 'zustand';

interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: { nom: string };
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

function loadFromStorage(): Pick<AuthStore, 'user' | 'token' | 'isAuthenticated'> {
  try {
    const token = localStorage.getItem('civibot_token');
    const userRaw = localStorage.getItem('civibot_user');
    if (token && userRaw) {
      const user = JSON.parse(userRaw) as User;
      return { token, user, isAuthenticated: true };
    }
  } catch {}
  return { token: null, user: null, isAuthenticated: false };
}

export const useAuthStore = create<AuthStore>()((set) => ({
  ...loadFromStorage(),

  login: (user, token) => {
    localStorage.setItem('civibot_token', token);
    localStorage.setItem('civibot_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('civibot_token');
    localStorage.removeItem('civibot_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
