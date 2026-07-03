import type { Post } from "@server/db/schema";
import {
  postsRepository,
  savedPostsRepository,
  type FeedPost,
  type PostWithAuthorAndCourse
} from "@server/repositories";
import {
  buildPaginatedResult,
  normalizePaginationInput,
  resolvePagination,
  type PaginatedResult,
  type PaginationInput
} from "./PaginationService";

type PostsRepository = Pick<typeof postsRepository, "countFeed" | "delete" | "findById" | "findFeedByCourse">;
type SavedPostsRepository = Pick<
  typeof savedPostsRepository,
  "getSaveCountForPost" | "getSaveCountsForPosts" | "hasUserSavedPost" | "hasUserSavedPosts"
>;

export type HydratedPost = PostWithAuthorAndCourse & {
  hasSaved: boolean;
  savesCount: number;
};

export type HydratedFeedPost = Omit<FeedPost, "saveCount"> & {
  hasSaved: boolean;
  savesCount: number;
};

export type PostsServiceDependencies = {
  postsRepository?: PostsRepository;
  savedPostsRepository?: SavedPostsRepository;
};

export function createPostsService(dependencies: PostsServiceDependencies = {}) {
  const postRepo = dependencies.postsRepository ?? postsRepository;
  const saveRepo = dependencies.savedPostsRepository ?? savedPostsRepository;

  return {
    async getCourseFeed(
      userId: string,
      courseId: string,
      input: PaginationInput = {},
    ): Promise<PaginatedResult<HydratedFeedPost>> {
      const requested = normalizePaginationInput(input);
      const totalItems = await postRepo.countFeed(courseId);
      const resolved = resolvePagination(requested, totalItems);
      const feedPosts = await postRepo.findFeedByCourse(courseId, {
        limit: resolved.limit,
        offset: resolved.offset
      });
      const postIds = feedPosts.map((feedPost) => feedPost.post.id);
      const [saveCounts, savedMap] = await Promise.all([
        saveRepo.getSaveCountsForPosts(postIds),
        saveRepo.hasUserSavedPosts(userId, postIds)
      ]);
      const countMap = new Map(saveCounts.map((row) => [row.postId, row.saveCount]));
      const items = feedPosts.map((feedPost) => ({
        post: feedPost.post,
        author: feedPost.author,
        course: feedPost.course,
        hasSaved: savedMap[feedPost.post.id] ?? false,
        savesCount: countMap.get(feedPost.post.id) ?? 0
      }));

      return buildPaginatedResult(items, resolved);
    },

    async getPost(postId: string, userId?: string): Promise<HydratedPost | null> {
      const post = await postRepo.findById(postId);

      if (!post) {
        return null;
      }

      const [savesCount, hasSaved] = await Promise.all([
        saveRepo.getSaveCountForPost(postId),
        userId ? saveRepo.hasUserSavedPost(userId, postId) : Promise.resolve(false)
      ]);

      return {
        ...post,
        hasSaved,
        savesCount
      };
    },

    async deletePost(postId: string): Promise<Post | null> {
      return postRepo.delete(postId);
    }
  };
}

export const postsService = createPostsService();
