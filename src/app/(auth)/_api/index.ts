import { SERVER_URL } from "@/constants";
import axios, { AxiosError } from "axios";

export interface RegisterPayload {
  email: string;
  fullName: string;
  phoneNumber: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export async function loginApi(emailOrUsername: string, password: string) {
  try {
    const response = await axios.post(SERVER_URL + "/auth/login", {
      emailOrUsername,
      password,
    });
    return response.data; // Assuming the API returns user data on successful login
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError?.response?.data?.message || (error as Error).message
    );
  }
}

export async function registerApi(payload: RegisterPayload) {
  try {
    const response = await axios.post(SERVER_URL + "/users", payload);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError?.response?.data?.message || (error as Error).message
    );
  }
}

export async function verifyEmail(payload: { email: string; otp: string }) {
  try {
    const response = await axios.post(
      SERVER_URL + "/users/verify-email",
      payload
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error((error as Error).message);
  }
}

export async function resendToken(payload: { email: string }) {
  try {
    const response = await axios.post(
      SERVER_URL + "/users/resend-email-verification",
      payload
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw new Error((error as Error).message);
  }
}

export async function forgotPassword(payload: { email: string }) {
  try {
    const response = await axios.post(
      SERVER_URL + "/auth/forgot-password",
      payload
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError?.response?.data?.message || (error as Error).message
    );
  }
}

export async function resetPassword(payload: {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}) {
  try {
    const response = await axios.post(
      SERVER_URL + "/auth/reset-password",
      payload
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError?.response?.data?.message || (error as Error).message
    );
  }
}
