import api from "./api";

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  password_confirm: string;
}

export interface LoginData {
  phone: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface OTPResponse {
  message: string;
  email?: string;
  phone?: string;
  access?: string;
  refresh?: string;
}
export interface VerifyOTPResponse {
  message: string;
  phone_verified: boolean;
  account_active: boolean;
  access: string;
  refresh: string;
}

export const registerUser = async (
  data: RegisterData,
): Promise<OTPResponse> => {
  const response = await api.post("/auth/register/", data);
  return response.data;
};

export const verifyPhoneOTP = async (
  phone: string,
  otp: string,
): Promise<VerifyOTPResponse > => {
  const response = await api.post("/auth/verify-phone/", {
    phone,
    otp,
  });

  return response.data;
};

export const resendPhoneOTP = async (
  phone: string,
): Promise<OTPResponse> => {
  const response = await api.post("/auth/resend-otp/", {
    phone,
  });

  return response.data;
};

export const loginUser = async (
  data: LoginData,
): Promise<AuthResponse> => {
  const response = await api.post("/auth/login/", data);

  localStorage.setItem("access_token", response.data.access);
  localStorage.setItem("refresh_token", response.data.refresh);

  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const getProfile = async () => {
  const response = await api.get("/auth/profile/");
  return response.data;
};