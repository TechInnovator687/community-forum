import { savedPostsRepository, type SavedPostWithPost } from "@server/repositories";
import {
  buildPaginatedResult,
  normalizePaginationInput,
  resolvePagination,
  type PaginatedResult,
  type PaginationInput
} from "./PaginationService";
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
      const requested = normalizePaginationInput(input);
      const totalItems = await saveRepo.countSavedPosts(userId);
      const resolved = resolvePagination(requested, totalItems);
      const savedPosts = await saveRepo.getSavedPosts(userId, {
        limit: resolved.limit,
        offset: resolved.offset
      });
      const postIds = savedPosts.map((savedPost) => savedPost.post.id);
      const saveCounts = await saveRepo.getSaveCountsForPosts(postIds);
      const countMap = new Map(saveCounts.map((row) => [row.postId, row.saveCount]));
      const items = savedPosts.map((savedPost) => ({
        ...savedPost,
        hasSaved: true as const,
        savesCount: countMap.get(savedPost.post.id) ?? 0
      }));

      return buildPaginatedResult(items, resolved);
    },

    async hasSaved(userId: string, postId: string): Promise<boolean> {
      return saveRepo.hasUserSavedPost(userId, postId);
    }
  };
}

export const savedPostsService = createSavedPostsService();

