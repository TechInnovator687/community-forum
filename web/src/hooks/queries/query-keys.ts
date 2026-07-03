import type { ApiAuth, PaginationParams } from "@/lib/api";

export const queryKeys = {
  all: ["community-forum"] as const,
  posts: {
    all: () => [...queryKeys.all, "posts"] as const,
    detail: (postId: string, auth?: ApiAuth) => [...queryKeys.posts.all(), "detail", postId, auth] as const,
    feeds: () => [...queryKeys.posts.all(), "feeds"] as const,
    feed: (courseId: string, pagination: PaginationParams, auth: ApiAuth) =>
      [...queryKeys.posts.feeds(), courseId, pagination, auth] as const
  },
  savedPosts: {
    all: () => [...queryKeys.all, "saved-posts"] as const,
    lists: (auth: ApiAuth) => [...queryKeys.savedPosts.all(), "lists", auth] as const,
    list: (auth: ApiAuth, pagination: PaginationParams) =>
      [...queryKeys.savedPosts.lists(auth), pagination] as const
  }
};

