export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  langue: string;
  statut: string;
  role: { id: string; nom: string; description?: string };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
