import {
  postsRepository,
  savedPostsRepository,
  type FeedPost,
  type PostWithAuthorAndCourse
} from "@server/repositories";
import { createPaginatedResult, getPagination, type PaginatedResult, type PaginationInput } from "./pagination";

type PostsRepository = Pick<typeof postsRepository, "countFeed" | "findById" | "findFeedByCourse">;
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
      const pagination = getPagination(input);
      const [feedPosts, totalItems] = await Promise.all([
        postRepo.findFeedByCourse(courseId, pagination),
        postRepo.countFeed(courseId)
      ]);
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

      return createPaginatedResult(items, totalItems, pagination);
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
    }
  };
}

export const postsService = createPostsService();
