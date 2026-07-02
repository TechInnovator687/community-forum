import { Elysia } from "elysia";
import { z } from "zod";
import type { AuthenticatedUser } from "../types";
import { ApiError } from "./error-handler";

const userIdSchema = z.string().uuid();
const roleSchema = z.enum(["student", "moderator"]);

export function createAuthPlugin() {
  return new Elysia({ name: "auth" }).derive(({ request }) => ({
    user: getAuthenticatedUser(request.headers)
  }));
}

export function authenticateRequest(headers: Headers): AuthenticatedUser {
  const userId = headers.get("x-user-id");
  const role = headers.get("x-role");

  if (!userId || !role) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication headers are required.");
  }

  const parsedUserId = userIdSchema.safeParse(userId);
  const parsedRole = roleSchema.safeParse(role);

  if (!parsedUserId.success || !parsedRole.success) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication headers are invalid.");
  }

  return {
    id: parsedUserId.data,
    role: parsedRole.data
  };
}

export function getAuthenticatedUser(headers: Headers): AuthenticatedUser | null {
  try {
    return authenticateRequest(headers);
  } catch {
    return null;
  }
}
