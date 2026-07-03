"use client";

import { useLocale, useTranslations } from "next-intl";
import { Avatar, Badge } from "@/components/atoms";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/molecules";
import type { HydratedPost } from "@/lib/api";
import { formatDate } from "@/lib/utils/DateFormat";
import { BookmarkButton } from "@/components/molecules/BookmarkButton";
import { DeleteButton } from "@/components/molecules/DeleteButton";

type PostCardProps = {
  item: HydratedPost;
  isBookmarkPending?: boolean;
  onToggleBookmark: (postId: string, hasSaved: boolean) => void;
  canDelete?: boolean;
  isDeletePending?: boolean;
  onDelete?: ((postId: string) => void) | undefined;
};

export function PostCard({
  item,
  isBookmarkPending = false,
  onToggleBookmark,
  canDelete = false,
  isDeletePending = false,
  onDelete
}: PostCardProps) {
  const common = useTranslations("common");
  const t = useTranslations("feed.post");
  const nav = useTranslations("nav");
  const locale = useLocale();
  const { author, course, hasSaved, post, savesCount } = item;
  const isModerator = author.role === "moderator";

  return (
    <Card className="overflow-hidden transition-colors hover:border-primary/40">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar name={author.name} aria-hidden="true" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate text-sm font-semibold text-foreground">{author.name}</span>
                {isModerator ? (
                  <Badge variant="tint" className="shrink-0">
                    {nav("role.moderator")}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("byline", {
                  author: author.name,
                  date: formatDate(post.createdAt, locale)
                })}
              </p>
              <h2 className="mt-2 text-lg font-semibold leading-snug text-foreground">{post.title}</h2>
            </div>
          </div>
          <Badge variant="muted" className="w-fit shrink-0">
            {course.title}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
          <p className="whitespace-pre-line text-sm leading-6 text-foreground">{post.content}</p>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">{common("saves", { count: savesCount })}</span>
        <div className="flex items-center gap-1">
          {canDelete && onDelete ? (
            <DeleteButton
              isPending={isDeletePending}
              onDelete={() => {
                onDelete(post.id);
              }}
            />
          ) : null}
          <BookmarkButton
            hasSaved={hasSaved}
            isPending={isBookmarkPending}
            onToggle={() => {
              onToggleBookmark(post.id, hasSaved);
            }}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
