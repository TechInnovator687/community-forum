import type { Post } from "@server/db/schema";
import type { PaginatedResult, PaginationInput } from "@server/services";
import type { HydratedFeedPost, HydratedPost } from "@server/services/posts.service";
import type { HydratedSavedPost } from "@server/services/saved-posts.service";

export type UserRole = "student" | "moderator";

export type AuthenticatedUser = {
  id: string;
  role: UserRole;
};

export type ApiPostsService = {
  getCourseFeed(
    userId: string,
    courseId: string,
    pagination?: PaginationInput,
  ): Promise<PaginatedResult<HydratedFeedPost>>;
  getPost(postId: string, userId?: string): Promise<HydratedPost | null>;
  deletePost(postId: string): Promise<Post | null>;
};

export type ApiSavedPostsService = {
  getSavedPosts(userId: string, pagination?: PaginationInput): Promise<PaginatedResult<HydratedSavedPost>>;
  hasSaved(userId: string, postId: string): Promise<boolean>;
  savePost(userId: string, postId: string): Promise<unknown>;
  unsavePost(userId: string, postId: string): Promise<unknown>;
};

export type ApiEnrollmentsRepository = {
  isUserEnrolled(userId: string, courseId: string): Promise<boolean>;
};

export type ApiDependencies = {
  enrollmentsRepository: ApiEnrollmentsRepository;
  postsService: ApiPostsService;
  savedPostsService: ApiSavedPostsService;
};

