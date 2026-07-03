import { Elysia } from "elysia";
import { z } from "zod";
import { authenticateRequest } from "../plugins/AuthPlugin";
import { paginationQuerySchema, parseRequest } from "../plugins/RequestValidation";
import { assertCanAccessPost } from "./posts.routes";
import type { ApiDependencies } from "../ApiTypes";

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

      return dependencies.savedPostsService.getSavedPosts(user.id, pagination);
    });
}
