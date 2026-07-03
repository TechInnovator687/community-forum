"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { AlertTriangle, Clock, Inbox, MessagesSquare, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  EmptyState,
  FeedPagination,
  FeedSkeleton,
  PostCard,
  StatCard,
  ViewToggle,
  type ListView
} from "@/components/molecules";
import { PageHeader } from "@/components/organisms";
import { useDemoUser } from "@/components/providers/DemoUserProvider";
import { Container } from "@/components/templates";
import { useDeletePost, useSavePost, useUnsavePost } from "@/hooks/mutations";
import { useCourseFeed } from "@/hooks/queries";
import { ApiClientError, type PaginationParams } from "@/lib/api";

type FeedTemplateProps = {
  courseId: string;
  pagination: Required<PaginationParams>;
};

export function FeedTemplate({ courseId, pagination }: FeedTemplateProps) {
  const t = useTranslations("feed");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: auth } = useDemoUser();
  const feedQuery = useCourseFeed({ auth, courseId, pagination });
  const savePost = useSavePost();
  const unsavePost = useUnsavePost();
  const deletePost = useDeletePost();
  const pendingPostId = savePost.isPending
    ? savePost.variables.postId
    : unsavePost.isPending
      ? unsavePost.variables.postId
      : undefined;
  const canDelete = auth.role === "moderator";
  const [view, setView] = useState<ListView>("list");
  const courseTitle = feedQuery.data?.items[0]?.course.title;
  const totalItems = feedQuery.data?.totalItems;

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams);

    params.set("page", String(nextPage));
    params.set("pageSize", String(pagination.pageSize));
    router.push(`${pathname}?${params.toString()}` as Route);
  }

  function handleToggleBookmark(postId: string, hasSaved: boolean) {
    const variables = { auth, postId };

    if (hasSaved) {
      unsavePost.mutate(variables);
      return;
    }

    savePost.mutate(variables);
  }

  function handleDeletePost(postId: string) {
    if (window.confirm(t("post.delete.confirm"))) {
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
        {feedQuery.isLoading ? <FeedSkeleton /> : null}
        {feedQuery.isError ? <FeedError error={feedQuery.error} /> : null}
        {feedQuery.data && feedQuery.data.items.length === 0 ? (
          <EmptyState
            icon={<Inbox className="size-5" aria-hidden="true" />}
            title={t("empty.title")}
            description={t("empty.description")}
          />
        ) : null}
        {feedQuery.data && feedQuery.data.items.length > 0 ? (
          <div className="grid gap-4">
            <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
              {feedQuery.data.items.map((item) => (
                <PostCard
                  key={item.post.id}
                  item={item}
                  isBookmarkPending={pendingPostId === item.post.id}
                  onToggleBookmark={handleToggleBookmark}
                  canDelete={canDelete}
                  isDeletePending={deletePost.variables?.postId === item.post.id && deletePost.isPending}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
            <FeedPagination
              page={feedQuery.data.page}
              pageCount={feedQuery.data.totalPages}
              hasPreviousPage={feedQuery.data.hasPreviousPage}
              hasNextPage={feedQuery.data.hasNextPage}
              isFetching={feedQuery.isFetching}
              onPageChange={handlePageChange}
            />
          </div>
        ) : null}
      </div>
      <aside className="hidden gap-4 lg:sticky lg:top-8 lg:grid">
        <StatCard
          icon={<MessagesSquare className="size-4" aria-hidden="true" />}
          title={t("rail.activity.title", { count: totalItems ?? 0 })}
          description={courseTitle ?? t("rail.activity.fallback")}
        />
        <StatCard
          icon={<Sparkles className="size-4" aria-hidden="true" />}
          title={t("rail.tip.title")}
          description={t("rail.tip.description")}
        />
      </aside>
    </Container>
  );
}

function FeedError({ error }: { error: Error }) {
  const t = useTranslations("feed.error");
  const description = error instanceof ApiClientError ? error.message : t("description");

  return (
    <EmptyState
      icon={<AlertTriangle className="size-5 text-destructive" aria-hidden="true" />}
      title={t("title")}
      description={description}
    />
  );
}
