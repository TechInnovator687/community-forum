import { Elysia } from "elysia";
import { z } from "zod";
import { assertCanAccessCourse, assertModerator } from "../authorization";
import { authenticateRequest } from "../plugins/AuthPlugin";
import { ApiError } from "../plugins/ErrorHandlerPlugin";
import { paginationQuerySchema, parseRequest } from "../plugins/RequestValidation";
import type { ApiDependencies } from "../ApiTypes";

const coursePostsParamsSchema = z.object({
  courseId: z.string().uuid()
});

const postIdParamsSchema = z.object({
  postId: z.string().uuid()
});

export function createPostsRoutes(dependencies: ApiDependencies) {
  return new Elysia({ name: "posts-routes" })
    .get("/courses/:courseId/posts", async ({ params, query, request }) => {
      const user = authenticateRequest(request.headers);
      const { courseId } = parseRequest(coursePostsParamsSchema, params);
      const pagination = parseRequest(paginationQuerySchema, query);

      await assertCanAccessCourse(user, courseId, dependencies.enrollmentsRepository);

      return dependencies.postsService.getCourseFeed(user.id, courseId, pagination);
    })
    .delete("/posts/:postId", async ({ params, request, set }) => {
      const user = authenticateRequest(request.headers);
      const { postId } = parseRequest(postIdParamsSchema, params);

      assertModerator(user);

      const deleted = await dependencies.postsService.deletePost(postId);

      if (!deleted) {
        throw new ApiError(404, "NOT_FOUND", "Post was not found.");
      }

      set.status = 204;
    });
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
