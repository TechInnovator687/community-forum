import type { Query, QueryClient } from "@tanstack/react-query";
import type { ApiAuth, HydratedPost, HydratedSavedPost, PaginatedApiResponse } from "@/lib/api";
import { queryKeys } from "../queries/query-keys";

type CachedFeed = PaginatedApiResponse<HydratedPost>;
type CachedSavedPosts = PaginatedApiResponse<HydratedSavedPost>;

export type MutationSnapshot = {
  feeds: Array<[readonly unknown[], unknown]>;
  savedPosts: Array<[readonly unknown[], unknown]>;
};

export async function prepareSaveMutation(queryClient: QueryClient): Promise<MutationSnapshot> {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: queryKeys.posts.feeds() }),
    queryClient.cancelQueries({ queryKey: queryKeys.savedPosts.all() })
  ]);

  return {
    feeds: queryClient.getQueriesData({ queryKey: queryKeys.posts.feeds() }),
    savedPosts: queryClient.getQueriesData({ queryKey: queryKeys.savedPosts.all() })
  };
}

export function restoreMutationSnapshot(queryClient: QueryClient, snapshot?: MutationSnapshot) {
  snapshot?.feeds.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
  snapshot?.savedPosts.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}

// Query keys embed the acting user's auth at different positions (see
// query-keys.ts), so we scan for it instead of assuming a fixed index. This
// keeps optimistic updates from leaking into another demo identity's cached
// data when switching users mid-session.
function belongsToUser(query: Query, auth: ApiAuth): boolean {
  return query.queryKey.some(
    (segment) =>
      typeof segment === "object" &&
      segment !== null &&
      "userId" in segment &&
      (segment as ApiAuth).userId === auth.userId,
  );
}

export function markPostSaved(queryClient: QueryClient, postId: string, auth: ApiAuth) {
  queryClient.setQueriesData<CachedFeed>(
    { queryKey: queryKeys.posts.feeds(), predicate: (query) => belongsToUser(query, auth) },
    (data) => {
      if (!data) {
        return data;
      }

      return {
        ...data,
        items: data.items.map((item) =>
          item.post.id === postId
            ? { ...item, hasSaved: true, savesCount: item.hasSaved ? item.savesCount : item.savesCount + 1 }
            : item,
        )
      };
    },
  );
}

export function markPostUnsaved(queryClient: QueryClient, postId: string, auth: ApiAuth) {
  queryClient.setQueriesData<CachedFeed>(
    { queryKey: queryKeys.posts.feeds(), predicate: (query) => belongsToUser(query, auth) },
    (data) => {
      if (!data) {
        return data;
      }

      return {
        ...data,
        items: data.items.map((item) =>
          item.post.id === postId
            ? { ...item, hasSaved: false, savesCount: Math.max(0, item.savesCount - 1) }
            : item,
        )
      };
    },
  );
  queryClient.setQueriesData<CachedSavedPosts>(
    { queryKey: queryKeys.savedPosts.all(), predicate: (query) => belongsToUser(query, auth) },
    (data) => {
      if (!data) {
        return data;
      }

      const items = data.items.filter((item) => item.post.id !== postId);
      const totalItems = Math.max(0, data.totalItems - 1);

      return {
        ...data,
        items,
        totalItems,
        totalPages: Math.max(0, Math.ceil(totalItems / data.pageSize)),
        hasNextPage: data.page * data.pageSize < totalItems
      };
    },
  );
}

export function invalidatePostCaches(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.posts.feeds() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.savedPosts.all() })
  ]);
}
