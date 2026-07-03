"use client";

import { QueryClient } from "@tanstack/react-query";
import { DEFAULT_QUERY_STALE_TIME_MS } from "@/constants";

let browserQueryClient: QueryClient | undefined;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_QUERY_STALE_TIME_MS,
        refetchOnWindowFocus: false
      }
    }
  });
}

export function getQueryClient() {
  if (typeof window === "undefined") {
    return createQueryClient();
  }

  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}
