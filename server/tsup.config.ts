import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/ServerEntry.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  splitting: false,
  dts: false,
  // "@community-forum/shared" is a workspace package whose package.json
  // "exports" point straight at TypeScript source (no build step of its
  // own), so it can't be resolved by plain Node at runtime. Bundling it in
  // keeps that package free of a build step while every other dependency
  // stays external and is resolved from node_modules as normal.
  noExternal: ["@community-forum/shared"]
});
