import { ApiClientError } from "@/lib/api";

export function formatError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}
