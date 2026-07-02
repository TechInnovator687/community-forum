import { describe, expect, it, vi } from "vitest";
import type { Course, Post, SavedPost, User } from "@server/db/schema";

vi.mock("@server/repositories", () => ({
  savedPostsRepository: {}
}));

import { createSavedPostsService } from "./saved-posts.service";
import { ServiceInvariantError } from "./service-errors";

const now = new Date("2026-07-02T10:00:00.000Z");
const deletedAt = new Date("2026-07-02T11:00:00.000Z");

const user = {
  id: "user-1",
  name: "Ava Patel",
  email: "ava@example.com",
  role: "student",
  createdAt: now,
  updatedAt: now
} satisfies User;

const course = {
  id: "course-1",
  slug: "web-foundations",
  title: "Web Foundations",
  description: null,
  createdAt: now,
  updatedAt: now
} satisfies Course;

const post = {
  id: "post-1",
  courseId: course.id,
  authorId: user.id,
  title: "Question",
  content: "How should saved posts work?",
  createdAt: now,
  updatedAt: now
} satisfies Post;

function createSavedPost(overrides: Partial<SavedPost> = {}): SavedPost {
  return {
    id: "save-1",
    userId: user.id,
    postId: post.id,
    savedAt: now,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

function resolved<T>(value: T) {
  return vi.fn(() => Promise.resolve(value));
}

function createRepository(overrides = {}) {
  return {
    countSavedPosts: resolved(0),
    create: resolved(createSavedPost()),
    findByUserAndPost: resolved<SavedPost | null>(null),
    getSaveCountsForPosts: resolved([]),
    getSavedPosts: resolved([]),
    hasUserSavedPost: resolved(false),
    reactivate: resolved<SavedPost | null>(createSavedPost()),
    softDelete: resolved<SavedPost | null>(createSavedPost({ deletedAt })),
    ...overrides
  };
}

describe("createSavedPostsService", () => {
  it("creates a save when no history exists", async () => {
    const repository = createRepository();
    const service = createSavedPostsService({ savedPostsRepository: repository });

    const result = await service.savePost(user.id, post.id);

    expect(result.deletedAt).toBeNull();
    expect(repository.create).toHaveBeenCalledWith({ userId: user.id, postId: post.id });
    expect(repository.reactivate).not.toHaveBeenCalled();
  });

  it("treats duplicate active saves as a no-op", async () => {
    const activeSave = createSavedPost();
    const repository = createRepository({
      findByUserAndPost: resolved(activeSave)
    });
    const service = createSavedPostsService({ savedPostsRepository: repository });

    await expect(service.savePost(user.id, post.id)).resolves.toBe(activeSave);
    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.reactivate).not.toHaveBeenCalled();
  });

  it("reactivates a soft-deleted save instead of creating another row", async () => {
    const repository = createRepository({
      findByUserAndPost: resolved(createSavedPost({ deletedAt }))
    });
    const service = createSavedPostsService({ savedPostsRepository: repository });

    const result = await service.savePost(user.id, post.id);

    expect(result.deletedAt).toBeNull();
    expect(repository.reactivate).toHaveBeenCalledWith(user.id, post.id);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("throws when save history exists but cannot be reactivated", async () => {
    const repository = createRepository({
      findByUserAndPost: resolved(createSavedPost({ deletedAt })),
      reactivate: resolved<SavedPost | null>(null)
    });
    const service = createSavedPostsService({ savedPostsRepository: repository });

    await expect(service.savePost(user.id, post.id)).rejects.toBeInstanceOf(ServiceInvariantError);
  });

  it("soft deletes an active save", async () => {
    const repository = createRepository({
      findByUserAndPost: resolved(createSavedPost())
    });
    const service = createSavedPostsService({ savedPostsRepository: repository });

    const result = await service.unsavePost(user.id, post.id);

    expect(result?.deletedAt).toEqual(deletedAt);
    expect(repository.softDelete).toHaveBeenCalledWith(user.id, post.id);
  });

  it("treats repeated un-save as a no-op", async () => {
    const deletedSave = createSavedPost({ deletedAt });
    const repository = createRepository({
      findByUserAndPost: resolved(deletedSave)
    });
    const service = createSavedPostsService({ savedPostsRepository: repository });

    await expect(service.unsavePost(user.id, post.id)).resolves.toBe(deletedSave);
    expect(repository.softDelete).not.toHaveBeenCalled();
  });

  it("builds a hydrated paginated saved-post list", async () => {
    const repository = createRepository({
      countSavedPosts: resolved(12),
      getSaveCountsForPosts: resolved([{ postId: post.id, saveCount: 3 }]),
      getSavedPosts: resolved([{ savedPost: createSavedPost(), post, author: user, course }])
    });
    const service = createSavedPostsService({ savedPostsRepository: repository });

    const result = await service.getSavedPosts(user.id, { page: 2, pageSize: 5 });

    expect(repository.getSavedPosts).toHaveBeenCalledWith(user.id, { limit: 5, offset: 5 });
    expect(result.totalPages).toBe(3);
    expect(result.items[0]).toMatchObject({ hasSaved: true, savesCount: 3 });
  });

  it("delegates saved-state checks to the repository", async () => {
    const repository = createRepository({
      hasUserSavedPost: resolved(true)
    });
    const service = createSavedPostsService({ savedPostsRepository: repository });

    await expect(service.hasSaved(user.id, post.id)).resolves.toBe(true);
    expect(repository.hasUserSavedPost).toHaveBeenCalledWith(user.id, post.id);
  });
});
