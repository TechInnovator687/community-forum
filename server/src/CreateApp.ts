import cors from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { Elysia } from "elysia";
import { createApi, type ApiDependencies } from "@server/api";

export const createApp = (dependencies?: Partial<ApiDependencies>) =>
  new Elysia({ adapter: node() })
    .use(
      cors({
        origin: true
      }),
    )
    .group("/api", (app) => app.use(createApi(dependencies)));

export type App = ReturnType<typeof createApp>;
