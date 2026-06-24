export interface AdminUserSummary {
  id: number;
  fullName: string;
  email: string;
  roles: string[];
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminSession {
  token: string;
  tokenType: string;
  expiresInMs: number;
  user: AdminUserSummary;
}