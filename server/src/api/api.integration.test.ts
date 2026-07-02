import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiDependencies } from "./types";
import type { Course, Post, User } from "@server/db/schema";
import type { HydratedFeedPost, HydratedPost } from "@server/services";

const studentId = "10000000-0000-4000-8000-000000000002";
const moderatorId = "10000000-0000-4000-8000-000000000001";
const courseId = "20000000-0000-4000-8000-000000000001";
const otherCourseId = "20000000-0000-4000-8000-000000000002";
const postId = "30000000-0000-4000-8000-000000000001";
const now = new Date("2026-07-02T10:00:00.000Z");

const author = {
  id: studentId,
  name: "Ava Patel",
  email: "ava@example.com",
  role: "student",
  createdAt: now,
  updatedAt: now
} satisfies User;

const course = {
  id: courseId,
  slug: "web-foundations",
  title: "Web Foundations",
  description: null,
  createdAt: now,
  updatedAt: now
} satisfies Course;

const otherCourse = {
  ...course,
  id: otherCourseId,
  slug: "database-systems",
  title: "Database Systems"
} satisfies Course;

const post = {
  id: postId,
  courseId,
  authorId: author.id,
  title: "Welcome",
  content: "Discussion content",
  createdAt: now,
  updatedAt: now
} satisfies Post;

const hydratedPost = {
  post,
  author,
  course,
  hasSaved: false,
  savesCount: 2
} satisfies HydratedPost;

function resolved<T>(value: T) {
  return vi.fn(() => Promise.resolve(value));
}

function createDependencies(overrides: Partial<ApiDependencies> = {}): ApiDependencies {
  return {
    enrollmentsRepository: {
      isUserEnrolled: resolved(true)
    },
    postsService: {
      getCourseFeed: resolved({
        items: [{ ...hydratedPost, hasSaved: true, savesCount: 3 } satisfies HydratedFeedPost],
        page: 1,
        pageSize: 20,
        totalItems: 1,
        totalPages: 1
      }),
      getPost: resolved<HydratedPost | null>(hydratedPost)
    },
    savedPostsService: {
      getSavedPosts: resolved({
        items: [
          {
            savedPost: {
              id: "40000000-0000-4000-8000-000000000001",
              userId: studentId,
              postId,
              savedAt: now,
              deletedAt: null,
              createdAt: now,
              updatedAt: now
            },
            post,
            author,
            course,
            hasSaved: true,
            savesCount: 3
          }
        ],
        page: 1,
        pageSize: 20,
        totalItems: 1,
        totalPages: 1
      }),
      hasSaved: resolved(true),
      savePost: resolved({ id: "40000000-0000-4000-8000-000000000001" }),
      unsavePost: resolved({ id: "40000000-0000-4000-8000-000000000001", deletedAt: now })
    },
    ...overrides
  };
}

async function createTestApp(dependencies: ApiDependencies) {
  process.env.DATABASE_URL = "postgres://community_forum:community_forum@localhost:5432/community_forum";
  const { createApp } = await import("../app");

  return createApp(dependencies);
}

function authHeaders(userId = studentId, role = "student") {
  return {
    "x-user-id": userId,
    "x-role": role
  };
}

async function parseJson(response: Response) {
  return response.json() as Promise<unknown>;
}

function expectMock(object: object, key: string) {
  return expect((object as Record<string, unknown>)[key] as ReturnType<typeof vi.fn>);
}

describe("api routes", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("saves a post for an enrolled student", async () => {
    const dependencies = createDependencies();
    const app = await createTestApp(dependencies);
    const response = await app.handle(
      new Request(`http://localhost/api/posts/${postId}/save`, {
        method: "POST",
        headers: authHeaders()
      }),
    );

    expect(response.status).toBe(200);
    expectMock(dependencies.savedPostsService, "savePost").toHaveBeenCalledWith(studentId, postId);
  });

  it("retrieves the authenticated user's saved posts", async () => {
    const dependencies = createDependencies();
    const app = await createTestApp(dependencies);
    const response = await app.handle(
      new Request("http://localhost/api/me/saved-posts?page=1&pageSize=20", {
        headers: authHeaders()
      }),
    );
    const body = await parseJson(response);

    expect(response.status).toBe(200);
    expectMock(dependencies.savedPostsService, "getSavedPosts").toHaveBeenCalledWith(studentId, {
      page: 1,
      pageSize: 20
    });
    expect(body).toMatchObject({
      pagination: {
        totalItems: 1
      }
    });
  });

  it("returns 401 when authentication headers are missing", async () => {
    const app = await createTestApp(createDependencies());
    const response = await app.handle(new Request(`http://localhost/api/courses/${courseId}/posts`));

    expect(response.status).toBe(401);
    await expect(parseJson(response)).resolves.toMatchObject({
      error: {
        code: "UNAUTHORIZED"
      }
    });
  });

  it("returns 403 when a student accesses a course they are not enrolled in", async () => {
    const dependencies = createDependencies({
      enrollmentsRepository: {
        isUserEnrolled: resolved(false)
      }
    });
    const app = await createTestApp(dependencies);
    const response = await app.handle(
      new Request(`http://localhost/api/courses/${otherCourseId}/posts`, {
        headers: authHeaders()
      }),
    );

    expect(response.status).toBe(403);
    expectMock(dependencies.postsService, "getCourseFeed").not.toHaveBeenCalled();
  });

  it("returns 403 when a student saves a post from another course", async () => {
    const dependencies = createDependencies({
      enrollmentsRepository: {
        isUserEnrolled: resolved(false)
      },
      postsService: {
        ...createDependencies().postsService,
        getPost: resolved({ ...hydratedPost, course: otherCourse })
      }
    });
    const app = await createTestApp(dependencies);
    const response = await app.handle(
      new Request(`http://localhost/api/posts/${postId}/save`, {
        method: "POST",
        headers: authHeaders()
      }),
    );

    expect(response.status).toBe(403);
    expectMock(dependencies.savedPostsService, "savePost").not.toHaveBeenCalled();
  });

  it("returns 404 when saving a missing post", async () => {
    const dependencies = createDependencies({
      postsService: {
        ...createDependencies().postsService,
        getPost: resolved<HydratedPost | null>(null)
      }
    });
    const app = await createTestApp(dependencies);
    const response = await app.handle(
      new Request(`http://localhost/api/posts/${postId}/save`, {
        method: "POST",
        headers: authHeaders(moderatorId, "moderator")
      }),
    );

    expect(response.status).toBe(404);
    expectMock(dependencies.savedPostsService, "savePost").not.toHaveBeenCalled();
  });
});
