import { clientEnv } from "@/config/env";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiClient<TResponse>(path: string, options: RequestOptions = {}) {
  const { body, headers, ...init } = options;
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Content-Type", "application/json");

  const requestInit: RequestInit = {
    ...init,
    headers: requestHeaders
  };

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  const response = await fetch(new URL(path, clientEnv.NEXT_PUBLIC_API_URL), {
    ...requestInit
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${String(response.status)}`);
  }

  return (await response.json()) as TResponse;
}
