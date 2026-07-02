import {
  savedPostsRepository,
  type SavedPostWithPost,
  type SavedPostsPagination
} from "@server/repositories";
import { createPaginatedResult, getPagination, type PaginatedResult, type PaginationInput } from "./pagination";
import { ServiceInvariantError } from "./service-errors";

type SavedPostsRepository = Pick<
  typeof savedPostsRepository,
  | "countSavedPosts"
  | "create"
  | "findByUserAndPost"
  | "getSaveCountsForPosts"
  | "getSavedPosts"
  | "hasUserSavedPost"
  | "reactivate"
  | "softDelete"
>;

export type HydratedSavedPost = SavedPostWithPost & {
  hasSaved: true;
  savesCount: number;
};

export type SavedPostsServiceDependencies = {
  savedPostsRepository?: SavedPostsRepository;
};

export function createSavedPostsService(dependencies: SavedPostsServiceDependencies = {}) {
  const saveRepo = dependencies.savedPostsRepository ?? savedPostsRepository;

  return {
    async savePost(userId: string, postId: string) {
      const existingSave = await saveRepo.findByUserAndPost(userId, postId);

      if (!existingSave) {
        return saveRepo.create({ userId, postId });
      }

      if (!existingSave.deletedAt) {
        return existingSave;
      }

      const reactivatedSave = await saveRepo.reactivate(userId, postId);

      if (!reactivatedSave) {
        throw new ServiceInvariantError("Unable to reactivate saved post.");
      }

      return reactivatedSave;
    },

    async unsavePost(userId: string, postId: string) {
      const existingSave = await saveRepo.findByUserAndPost(userId, postId);

      if (!existingSave || existingSave.deletedAt) {
        return existingSave;
      }

      return saveRepo.softDelete(userId, postId);
    },

    async getSavedPosts(
      userId: string,
      input: PaginationInput = {},
    ): Promise<PaginatedResult<HydratedSavedPost>> {
      const pagination = getPagination(input);
      const repositoryPagination: SavedPostsPagination = {
        limit: pagination.limit,
        offset: pagination.offset
      };
      const [savedPosts, totalItems] = await Promise.all([
        saveRepo.getSavedPosts(userId, repositoryPagination),
        saveRepo.countSavedPosts(userId)
      ]);
      const postIds = savedPosts.map((savedPost) => savedPost.post.id);
      const saveCounts = await saveRepo.getSaveCountsForPosts(postIds);
      const countMap = new Map(saveCounts.map((row) => [row.postId, row.saveCount]));
      const items = savedPosts.map((savedPost) => ({
        ...savedPost,
        hasSaved: true as const,
        savesCount: countMap.get(savedPost.post.id) ?? 0
      }));

      return createPaginatedResult(items, totalItems, pagination);
    },

    async hasSaved(userId: string, postId: string): Promise<boolean> {
      return saveRepo.hasUserSavedPost(userId, postId);
    }
  };
}

export const savedPostsService = createSavedPostsService();

