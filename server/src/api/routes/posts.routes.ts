import { Elysia } from "elysia";
import { z } from "zod";
import { assertCanAccessCourse } from "../authorization";
import { authenticateRequest } from "../plugins/auth";
import { ApiError } from "../plugins/error-handler";
import { paginationQuerySchema, parseRequest } from "../plugins/validation";
import type { ApiDependencies } from "../types";

const coursePostsParamsSchema = z.object({
  courseId: z.string().uuid()
});

export function createPostsRoutes(dependencies: ApiDependencies) {
  return new Elysia({ name: "posts-routes" }).get(
    "/courses/:courseId/posts",
    async ({ params, query, request }) => {
      const user = authenticateRequest(request.headers);
      const { courseId } = parseRequest(coursePostsParamsSchema, params);
      const pagination = parseRequest(paginationQuerySchema, query);

      await assertCanAccessCourse(user, courseId, dependencies.enrollmentsRepository);

      const result = await dependencies.postsService.getCourseFeed(user.id, courseId, pagination);

      return {
        data: result.items,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          totalItems: result.totalItems,
          totalPages: result.totalPages
        }
      };
    },
  );
}

export async function assertCanAccessPost(
  dependencies: ApiDependencies,
  userId: string,
  postId: string,
  role: "student" | "moderator",
) {
  const post = await dependencies.postsService.getPost(postId, userId);

  if (!post) {
    throw new ApiError(404, "NOT_FOUND", "Post was not found.");
  }

  await assertCanAccessCourse({ id: userId, role }, post.course.id, dependencies.enrollmentsRepository);

  return post;
}
