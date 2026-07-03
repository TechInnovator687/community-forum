import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiEndpoints, apiRequest, type ApiAuth, type HydratedPost, type PaginatedApiResponse, type PaginationParams } from "@/lib/api";
import { queryKeys } from "./query-keys";

export type UseCourseFeedParams = {
  auth: ApiAuth;
  courseId: string;
  pagination?: PaginationParams;
};

export function useCourseFeed({ auth, courseId, pagination = {} }: UseCourseFeedParams) {
  return useQuery({
    queryKey: queryKeys.posts.feed(courseId, pagination, auth),
    queryFn: () =>
      apiRequest<PaginatedApiResponse<HydratedPost>>(apiEndpoints.courseFeed(courseId, pagination), {
        auth
      }),
    placeholderData: keepPreviousData
  });
}

