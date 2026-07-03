import { Elysia } from "elysia";
import { enrollmentsRepository } from "@server/repositories";
import { postsService, savedPostsService } from "@server/services";
import { createAuthPlugin, createErrorHandlerPlugin, mapApiError } from "./plugins";
import { createPostsRoutes, createSavedPostsRoutes } from "./routes";
import type { ApiDependencies } from "./ApiTypes";

const defaultDependencies = {
  enrollmentsRepository,
  postsService,
  savedPostsService
} satisfies ApiDependencies;

export function createApi(dependencies: Partial<ApiDependencies> = {}) {
  const apiDependencies = {
    ...defaultDependencies,
    ...dependencies
  };

  return new Elysia({ name: "api" })
    .use(createErrorHandlerPlugin())
    .use(createAuthPlugin())
    .use(createPostsRoutes(apiDependencies))
    .use(createSavedPostsRoutes(apiDependencies))
    .onError(({ error, set }) => {
      const response = mapApiError(error);

      set.status = response.status;
      return response.body;
    });
}

export type { ApiDependencies };
