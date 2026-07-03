"use client";

import { PostCard } from "@/components/molecules/PostCard";
import type { HydratedPost, HydratedSavedPost } from "@/lib/api";

type SavedPostCardProps = {
  item: HydratedSavedPost;
  isBookmarkPending?: boolean;
  onRemoveBookmark: (postId: string) => void;
  canDelete?: boolean;
  isDeletePending?: boolean;
  onDelete?: ((postId: string) => void) | undefined;
};

export function SavedPostCard({
  item,
  isBookmarkPending = false,
  onRemoveBookmark,
  canDelete = false,
  isDeletePending = false,
  onDelete
}: SavedPostCardProps) {
  return (
    <PostCard
      item={toHydratedPost(item)}
      isBookmarkPending={isBookmarkPending}
      onToggleBookmark={(postId) => {
        onRemoveBookmark(postId);
      }}
      canDelete={canDelete}
      isDeletePending={isDeletePending}
      onDelete={onDelete}
    />
  );
}

function toHydratedPost(item: HydratedSavedPost): HydratedPost {
  return {
    post: item.post,
    author: item.author,
    course: item.course,
    hasSaved: item.hasSaved,
    savesCount: item.savesCount
  };
}
