import { Elysia } from "elysia";
import { ZodError } from "zod";
import { ServiceInvariantError } from "@server/services";

export type ErrorCode =
  | "BAD_REQUEST"
  | "FORBIDDEN"
  | "INTERNAL_SERVER_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function createErrorHandlerPlugin() {
  return new Elysia({ name: "error-handler" }).onError(({ error, set }) => {
    const response = mapApiError(error);

    set.status = response.status;
    return response.body;
  });
}

export function mapApiError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      body: createErrorResponse(error.code, error.message, error.details)
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      body: createErrorResponse("VALIDATION_ERROR", "Request validation failed.", error.flatten())
    };
  }

  if (error instanceof ServiceInvariantError) {
    return {
      status: 409,
      body: createErrorResponse("BAD_REQUEST", error.message)
    };
  }

  return {
    status: 500,
    body: createErrorResponse("INTERNAL_SERVER_ERROR", "Internal server error.")
  };
}

export function createErrorResponse(code: ErrorCode, message: string, details?: unknown) {
  return {
    error: {
      code,
      message,
      details
    }
  };
}
