import type { PaginationParams } from "./ApiTypes";

function withPagination(path: string, pagination: PaginationParams = {}) {
  const searchParams = new URLSearchParams();

  if (pagination.page !== undefined) {
    searchParams.set("page", String(pagination.page));
  }

  if (pagination.pageSize !== undefined) {
    searchParams.set("pageSize", String(pagination.pageSize));
  }

  const query = searchParams.toString();

  return query ? `${path}?${query}` : path;
}

export const apiEndpoints = {
  courseFeed(courseId: string, pagination?: PaginationParams) {
    return withPagination(`/api/courses/${courseId}/posts`, pagination);
  },
  savePost(postId: string) {
    return `/api/posts/${postId}/save`;
  },
  deletePost(postId: string) {
    return `/api/posts/${postId}`;
  },
  savedPosts(pagination?: PaginationParams) {
    return withPagination("/api/me/saved-posts", pagination);
  }
} as const;

