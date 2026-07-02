import { Elysia } from "elysia";
import { z } from "zod";
import { authenticateRequest } from "../plugins/auth";
import { paginationQuerySchema, parseRequest } from "../plugins/validation";
import { assertCanAccessPost } from "./posts.routes";
import type { ApiDependencies } from "../types";

const postParamsSchema = z.object({
  postId: z.string().uuid()
});

export function createSavedPostsRoutes(dependencies: ApiDependencies) {
  return new Elysia({ name: "saved-posts-routes" })
    .post("/posts/:postId/save", async ({ params, request }) => {
      const user = authenticateRequest(request.headers);
      const { postId } = parseRequest(postParamsSchema, params);

      await assertCanAccessPost(dependencies, user.id, postId, user.role);

      return {
        data: await dependencies.savedPostsService.savePost(user.id, postId)
      };
    })
    .delete("/posts/:postId/save", async ({ params, request }) => {
      const user = authenticateRequest(request.headers);
      const { postId } = parseRequest(postParamsSchema, params);

      await assertCanAccessPost(dependencies, user.id, postId, user.role);

      return {
        data: await dependencies.savedPostsService.unsavePost(user.id, postId)
      };
    })
    .get("/me/saved-posts", async ({ query, request }) => {
      const user = authenticateRequest(request.headers);
      const pagination = parseRequest(paginationQuerySchema, query);
      const result = await dependencies.savedPostsService.getSavedPosts(user.id, pagination);

      return {
        data: result.items,
        pagination: {
          page: result.page,
          pageSize: result.pageSize,
          totalItems: result.totalItems,
          totalPages: result.totalPages
        }
      };
    });
}
