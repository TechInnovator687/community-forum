import { clientEnv } from "@/config/env";
import type { ApiErrorBody, RequestOptions } from "./ApiTypes";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiRequest<TResponse>(path: string, options: RequestOptions = {}) {
  const response = await fetch(new URL(path, clientEnv.NEXT_PUBLIC_API_URL), createRequestInit(options));
  const body = await parseResponseBody(response);

  if (!response.ok) {
    throw createApiError(response.status, body);
  }

  return body as TResponse;
}

function createRequestInit(options: RequestOptions): RequestInit {
  const { auth, body, headers, ...init } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    requestHeaders.set("x-user-id", auth.userId);
    requestHeaders.set("x-role", auth.role);
  }

  const requestInit: RequestInit = {
    ...init,
    headers: requestHeaders
  };

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  return requestInit;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(text) as unknown;
}

function createApiError(status: number, body: unknown) {
  if (isApiErrorBody(body)) {
    return new ApiClientError(status, body.error.code, body.error.message, body.error.details);
  }

  return new ApiClientError(status, "REQUEST_FAILED", `Request failed with status ${String(status)}`);
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "object" &&
    body.error !== null &&
    "code" in body.error &&
    "message" in body.error
  );
}
