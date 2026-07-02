import { defineWorkspace } from "vitest/config";

export default defineWorkspace(["web/vitest.config.ts", "server/vitest.config.ts", "shared/vitest.config.ts"]);
