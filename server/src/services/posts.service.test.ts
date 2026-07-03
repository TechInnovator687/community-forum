import { describe, expect, it, vi } from "vitest";
import type { Course, Post, User } from "@server/db/schema";

vi.mock("@server/repositories", () => ({
  postsRepository: {},
  savedPostsRepository: {}
}));

import { createPostsService } from "./posts.service";

const now = new Date("2026-07-02T10:00:00.000Z");

const author = {
  id: "user-1",
  name: "Noah Kim",
  email: "noah@example.com",
  role: "student",
  createdAt: now,
  updatedAt: now
} satisfies User;

const course = {
  id: "course-1",
  slug: "database-systems",
  title: "Database Systems",
  description: null,
  createdAt: now,
  updatedAt: now
} satisfies Course;

function createPost(id: string): Post {
  return {
    id,
    courseId: course.id,
    authorId: author.id,
    title: `Post ${id}`,
    content: "Discussion content",
    createdAt: now,
    updatedAt: now
  };
}

function resolved<T>(value: T) {
  return vi.fn(() => Promise.resolve(value));
}

function createRepositories(overrides = {}) {
  return {
    postsRepository: {
      countFeed: resolved(0),
      delete: resolved(null),
      findById: resolved(null),
      findFeedByCourse: resolved([])
    },
    savedPostsRepository: {
      getSaveCountForPost: resolved(0),
      getSaveCountsForPosts: resolved([]),
      hasUserSavedPost: resolved(false),
      hasUserSavedPosts: resolved({})
    },
    ...overrides
  };
}

describe("createPostsService", () => {
  it("builds a hydrated course feed with saved state and save counts", async () => {
    const firstPost = createPost("post-1");
    const secondPost = createPost("post-2");
    const repositories = createRepositories({
      postsRepository: {
        countFeed: resolved(7),
        findById: resolved(null),
        findFeedByCourse: resolved([
          { post: firstPost, author, course, saveCount: 0 },
          { post: secondPost, author, course, saveCount: 0 }
        ])
      },
      savedPostsRepository: {
        getSaveCountForPost: resolved(0),
        getSaveCountsForPosts: resolved([
          { postId: firstPost.id, saveCount: 4 },
          { postId: secondPost.id, saveCount: 1 }
        ]),
        hasUserSavedPost: resolved(false),
        hasUserSavedPosts: resolved({ [firstPost.id]: true, [secondPost.id]: false })
      }
    });
    const service = createPostsService(repositories);

    const result = await service.getCourseFeed(author.id, course.id, { page: 2, pageSize: 2 });

    expect(repositories.postsRepository.findFeedByCourse).toHaveBeenCalledWith(course.id, {
      limit: 2,
      offset: 2
    });
    expect(result).toMatchObject({
      page: 2,
      pageSize: 2,
      totalItems: 7,
      totalPages: 4,
      hasPreviousPage: true,
      hasNextPage: true
    });
    expect(result.items).toEqual([
      { post: firstPost, author, course, hasSaved: true, savesCount: 4 },
      { post: secondPost, author, course, hasSaved: false, savesCount: 1 }
    ]);
  });

  it("normalizes pagination edge cases for feeds", async () => {
    const repositories = createRepositories();
    const service = createPostsService(repositories);

    await service.getCourseFeed(author.id, course.id, { page: 0, pageSize: 250 });

    expect(repositories.postsRepository.findFeedByCourse).toHaveBeenCalledWith(course.id, {
      limit: 100,
      offset: 0
    });
  });

  it("clamps an out-of-range page down to the last page and returns its items", async () => {
    const firstPost = createPost("post-1");
    const repositories = createRepositories({
      postsRepository: {
        countFeed: resolved(7),
        findById: resolved(null),
        findFeedByCourse: resolved([{ post: firstPost, author, course, saveCount: 0 }])
      }
    });
    const service = createPostsService(repositories);

    const result = await service.getCourseFeed(author.id, course.id, { page: 999, pageSize: 5 });

    expect(repositories.postsRepository.findFeedByCourse).toHaveBeenCalledWith(course.id, {
      limit: 5,
      offset: 5
    });
    expect(result).toMatchObject({ page: 2, totalPages: 2, hasPreviousPage: true, hasNextPage: false });
    expect(result.items).toHaveLength(1);
  });

  it("does not request save hydration for an empty feed", async () => {
    const repositories = createRepositories();
    const service = createPostsService(repositories);

    const result = await service.getCourseFeed(author.id, course.id);

    expect(repositories.savedPostsRepository.getSaveCountsForPosts).toHaveBeenCalledWith([]);
    expect(repositories.savedPostsRepository.hasUserSavedPosts).toHaveBeenCalledWith(author.id, []);
    expect(result.items).toEqual([]);
  });

  it("returns a hydrated post when found", async () => {
    const post = createPost("post-1");
    const repositories = createRepositories({
      postsRepository: {
        countFeed: resolved(0),
        findById: resolved({ post, author, course }),
        findFeedByCourse: resolved([])
      },
      savedPostsRepository: {
        getSaveCountForPost: resolved(9),
        getSaveCountsForPosts: resolved([]),
        hasUserSavedPost: resolved(true),
        hasUserSavedPosts: resolved({})
      }
    });
    const service = createPostsService(repositories);

    await expect(service.getPost(post.id, author.id)).resolves.toEqual({
      post,
      author,
      course,
      hasSaved: true,
      savesCount: 9
    });
  });

  it("returns null for a missing post without extra hydration queries", async () => {
    const repositories = createRepositories();
    const service = createPostsService(repositories);

    await expect(service.getPost("missing-post", author.id)).resolves.toBeNull();
    expect(repositories.savedPostsRepository.getSaveCountForPost).not.toHaveBeenCalled();
    expect(repositories.savedPostsRepository.hasUserSavedPost).not.toHaveBeenCalled();
  });

  it("deletes a post by delegating to the repository", async () => {
    const post = createPost("post-1");
    const repositories = createRepositories({
      postsRepository: {
        countFeed: resolved(0),
        delete: resolved(post),
        findById: resolved(null),
        findFeedByCourse: resolved([])
      }
    });
    const service = createPostsService(repositories);

    await expect(service.deletePost(post.id)).resolves.toEqual(post);
    expect(repositories.postsRepository.delete).toHaveBeenCalledWith(post.id);
  });

  it("returns null when deleting a post that does not exist", async () => {
    const repositories = createRepositories();
    const service = createPostsService(repositories);

    await expect(service.deletePost("missing-post")).resolves.toBeNull();
  });
});
