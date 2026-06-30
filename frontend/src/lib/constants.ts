export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const DOMAINES = {
  ETAT_CIVIL: 'etat-civil',
  CREATION_ENTREPRISE: 'creation-entreprise',
} as const;

export const ROLES = {
  CITOYEN: 'citoyen',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super-admin',
} as const;
