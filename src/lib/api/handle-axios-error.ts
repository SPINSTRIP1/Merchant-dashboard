import { AxiosError } from "axios";

/**
 * Handles Axios errors and returns the error message from the response
 * @param error - The AxiosError object
 * @returns A string containing the error message
 */
export const handleAxiosError = (error: AxiosError<any>): string => {
  // Return the message from response data if available
  return (
    error?.response?.data?.message ||
    "An unexpected error occurred. Please try again."
  );
};
