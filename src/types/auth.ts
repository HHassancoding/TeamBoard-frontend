export interface User {
  id: number;
  name: string;
  email: string;
  avatarInitials?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}
