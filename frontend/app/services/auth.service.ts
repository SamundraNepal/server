import { apiClient } from "../lib/api";
import {
  ChnageResetPasswordDTO,
  LogInData,
  ResetPassword,
  ResetPasswordUserDTO,
  SingUpData,
  UpdatePasswordDTO,
  VerificationCodeData,
} from "../types/auth.types";

export const API_URL =
  typeof window === "undefined"
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_URL!;

export async function SignUpAPI(data: SingUpData) {
  const formData = new FormData();

  formData.append("firstName", data.firstName);
  formData.append("lastName", data.lastName);
  formData.append("emailAddress", data.emailAddress);
  formData.append("password", data.password);
  formData.append("confirmPassword", data.confirmPassword);

  // only add data if image data exits
  if (data.image) {
    formData.append("profileImage", data.image);
  }

  return apiClient("/user/signup", {
    method: "POST",
    body: formData,
  });
}

export async function LogInAPI(data: LogInData) {
  return apiClient("/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function VerificationCode(data: VerificationCodeData) {
  return apiClient("/user/verifyCode", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function GeneratePasswordResetLink(data: ResetPassword) {
  return apiClient("/user/generatePasswordResetLink", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function ResetPasswordUserData(data: ResetPasswordUserDTO) {
  return apiClient("/user/resetPasswordUserData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function ChangeResetPassword(data: ChnageResetPasswordDTO) {
  return apiClient("/user/changeResetPassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function LogoutUser() {
  return apiClient("/user/logout", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
}

// Home Page data
export async function GetHomePageDataUser(authToken: string) {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "POST",
    headers: {
      Cookie: `auth_token=${authToken}`,
    },
  });

  return response.json();
}

// to refetch user data
export async function GetUserData() {
  return apiClient("/auth/me", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
}

// update password
export async function UpdatePassword(data: UpdatePasswordDTO) {
  return apiClient("/user/updatePassword", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// Home Page data
export async function GetAdminData(authToken: any) {
  const response = await fetch(`${API_URL}/auth/admindata`, {
    method: "POST",
    headers: {
      Cookie: `auth_token=${authToken.value}`,
    },
  });

  return response.json();
}
