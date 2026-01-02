import api from "./api";


export interface LoginRequest{
    email: string;
    password: string;
}

export interface LoginResponse{
    token: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;  
}


export interface RegisterRequest{
    name: string;
    email: string;
    password: string;
    avatarInitials?: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse>{
    const response = await api.post<LoginResponse>
    (
        '/api/auth/login', 
        data
    );
    localStorage.setItem("token", response.data.token);
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
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
}


