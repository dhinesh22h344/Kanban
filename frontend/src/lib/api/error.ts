import { isAxiosError } from "axios";
import type { ApiError } from "@/types/api";

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
