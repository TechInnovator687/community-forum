import cors from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { Elysia } from "elysia";

export const createApp = () =>
  new Elysia({ adapter: node() })
    .use(
      cors({
        origin: true
      }),
    )
    .group("/api", (app) => app);

export type App = ReturnType<typeof createApp>;
