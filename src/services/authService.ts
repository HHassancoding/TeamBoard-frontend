import api from "./api";


export interface LoginRequest{
    email: string;
    password: string;
}

export interface LoginResponse{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    username: string;
}


export interface RegisterRequest{
    name: string;
    email: string;
    password: string;
    avatarInitials?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatarInitials?: string;
}


export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/api/auth/login",
    data
  );

  localStorage.setItem("accessToken", response.data.accessToken);
  localStorage.setItem("refreshToken", response.data.refreshToken);

  return response.data;
}


export async function register(data: RegisterRequest): Promise<string>{
    const response = await api.post<string>(
        '/api/auth/register', 
        data
    );
    return response.data;
}

export async function logout(){
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>("/api/auth/me");
  return response.data;
}



