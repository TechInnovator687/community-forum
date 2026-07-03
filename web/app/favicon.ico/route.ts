import { join } from "node:path";
import { readFile } from "node:fs/promises";

const faviconPath = join(process.cwd(), "public", "favicon.svg");

export async function GET() {
  const favicon = await readFile(faviconPath);

  return new Response(favicon, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/svg+xml"
    }
  });
}
