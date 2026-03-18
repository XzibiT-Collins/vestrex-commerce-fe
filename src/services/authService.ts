import api from './api';
import type {
    LoginRequest,
    RegistrationRequest,
    CustomApiResponse,
    AuthResponse,
    OtpVerificationRequest,
    EmailRequest,
    ResetPasswordRequest,
} from '../types';

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const res = await api.post<CustomApiResponse<AuthResponse>>('/auth/login', data);
        return res.data.data;
    },

    /** POST /auth/register — now returns 204 No Content (OTP sent to email) */
    register: async (data: RegistrationRequest): Promise<void> => {
        await api.post('/auth/register', data);
    },

    /** POST /auth/verify-otp — validates OTP, activates account, issues cookies */
    verifyOtp: async (data: OtpVerificationRequest): Promise<AuthResponse> => {
        const res = await api.post<CustomApiResponse<AuthResponse>>('/auth/verify-otp', data);
        return res.data.data;
    },

    /** POST /auth/resend-otp — requests a new OTP */
    resendOtp: async (data: EmailRequest): Promise<void> => {
        await api.post('/auth/resend-otp', data);
    },

    /** POST /auth/logout — clears server-side auth cookies */
    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },

    /** POST /auth/forgot-password — sends a password reset email */
    forgotPassword: async (data: EmailRequest): Promise<void> => {
        await api.post('/auth/forgot-password', data);
    },

    /** POST /auth/reset-password?resetPasswordToken=<token> — sets a new password */
    resetPassword: async (token: string, data: ResetPasswordRequest): Promise<void> => {
        await api.post('/auth/reset-password', data, {
            params: { resetPasswordToken: token },
        });
    },

    /** GET /auth/me — validates the session cookie & returns fresh user details on page refresh */
    getMe: async (): Promise<AuthResponse> => {
        const res = await api.get<CustomApiResponse<AuthResponse>>('/auth/me');
        return res.data.data;
    },
};
