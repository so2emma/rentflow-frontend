export interface LoginRequest {
    email: string;
    password?: string;
}

export const LoginRequestInitialState: LoginRequest = {
    email: '',
    password: '',
}
