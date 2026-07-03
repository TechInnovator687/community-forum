"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { AlertTriangle, Bookmark, Clock, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  EmptyState,
  SavedPagination,
  SavedPostCard,
  SavedSkeleton,
  StatCard,
  ViewToggle,
  type ListView
} from "@/components/molecules";
import { PageHeader } from "@/components/organisms";
import { useDemoUser } from "@/components/providers/DemoUserProvider";
import { Container } from "@/components/templates";
import { useDeletePost, useUnsavePost } from "@/hooks/mutations";
import { useSavedPosts } from "@/hooks/queries";
import { ApiClientError, type PaginationParams } from "@/lib/api";

type SavedPostsTemplateProps = {
  pagination: Required<PaginationParams>;
};

export function SavedPostsTemplate({ pagination }: SavedPostsTemplateProps) {
  const t = useTranslations("savedPosts");
  const tPost = useTranslations("feed.post");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: auth } = useDemoUser();
  const savedQuery = useSavedPosts({ auth, pagination });
  const unsavePost = useUnsavePost();
  const deletePost = useDeletePost();
  const pendingPostId = unsavePost.isPending ? unsavePost.variables.postId : undefined;
  const canDelete = auth.role === "moderator";
  const [view, setView] = useState<ListView>("list");
  const totalItems = savedQuery.data?.totalItems;

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams);

    params.set("page", String(nextPage));
    params.set("pageSize", String(pagination.pageSize));
    router.push(`${pathname}?${params.toString()}` as Route);
  }

  function handleRemoveBookmark(postId: string) {
    unsavePost.mutate({ auth, postId });
  }

  function handleDeletePost(postId: string) {
    if (window.confirm(tPost("delete.confirm"))) {
      deletePost.mutate({ auth, postId });
    }
  }

  return (
    <Container className="grid gap-6 pb-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-8">
      <div className="grid gap-6">
        <div className="z-10 grid gap-4 bg-background pb-4 pt-6 sm:pt-8 md:sticky md:top-0">
          <PageHeader title={t("title")} description={t("description")} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-4" aria-hidden="true" />
              {t("sortMostRecent")}
            </span>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
        {savedQuery.isLoading ? <SavedSkeleton /> : null}
        {savedQuery.isError ? <SavedError error={savedQuery.error} /> : null}
        {savedQuery.data && savedQuery.data.items.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="size-5" aria-hidden="true" />}
            title={t("empty.title")}
            description={t("empty.description")}
          />
        ) : null}
        {savedQuery.data && savedQuery.data.items.length > 0 ? (
          <div className="grid gap-4">
            <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
              {savedQuery.data.items.map((item) => (
                <SavedPostCard
                  key={item.savedPost.id}
                  item={item}
                  isBookmarkPending={pendingPostId === item.post.id}
                  onRemoveBookmark={handleRemoveBookmark}
                  canDelete={canDelete}
                  isDeletePending={deletePost.variables?.postId === item.post.id && deletePost.isPending}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
            <SavedPagination
              page={savedQuery.data.page}
              pageCount={savedQuery.data.totalPages}
              hasPreviousPage={savedQuery.data.hasPreviousPage}
              hasNextPage={savedQuery.data.hasNextPage}
              isFetching={savedQuery.isFetching}
              onPageChange={handlePageChange}
            />
          </div>
        ) : null}
      </div>
      <aside className="hidden gap-4 lg:sticky lg:top-8 lg:grid">
        <StatCard
          icon={<Bookmark className="size-4" aria-hidden="true" />}
          title={t("rail.total.title", { count: totalItems ?? 0 })}
          description={t("rail.total.description")}
        />
        <StatCard
          icon={<Star className="size-4" aria-hidden="true" />}
          title={t("rail.tip.title")}
          description={t("rail.tip.description")}
        />
      </aside>
    </Container>
  );
}

function SavedError({ error }: { error: Error }) {
  const t = useTranslations("savedPosts.error");
  const description = error instanceof ApiClientError ? error.message : t("description");

  return (
    <EmptyState
      icon={<AlertTriangle className="size-5 text-destructive" aria-hidden="true" />}
      title={t("title")}
      description={description}
    />
  );
}
