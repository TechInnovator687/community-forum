import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiEndpoints, apiRequest, type ApiAuth, type HydratedSavedPost, type PaginatedApiResponse, type PaginationParams } from "@/lib/api";
import { queryKeys } from "./query-keys";

export type UseSavedPostsParams = {
  auth: ApiAuth;
  pagination?: PaginationParams;
};

export function useSavedPosts({ auth, pagination = {} }: UseSavedPostsParams) {
  return useQuery({
    queryKey: queryKeys.savedPosts.list(auth, pagination),
    queryFn: () =>
      apiRequest<PaginatedApiResponse<HydratedSavedPost>>(apiEndpoints.savedPosts(pagination), {
        auth
      }),
    placeholderData: keepPreviousData
  });
}

