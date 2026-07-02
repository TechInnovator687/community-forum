import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const serverSrc = fileURLToPath(new URL("./src", import.meta.url));
const serverSrcWithSlash = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"]
  },
  resolve: {
    alias: [
      { find: /^@server\/(.*)$/, replacement: `${serverSrcWithSlash}$1` },
      { find: "@server", replacement: serverSrc },
      {
        find: "@community-forum/shared",
        replacement: fileURLToPath(new URL("../shared/src/index.ts", import.meta.url))
      }
    ]
  }
});
