import type { ApiEnrollmentsRepository, AuthenticatedUser } from "./types";
import { ApiError } from "./plugins/error-handler";

export async function assertCanAccessCourse(
  user: AuthenticatedUser,
  courseId: string,
  enrollmentsRepository: ApiEnrollmentsRepository,
): Promise<void> {
  if (user.role === "moderator") {
    return;
  }

  const isEnrolled = await enrollmentsRepository.isUserEnrolled(user.id, courseId);

  if (!isEnrolled) {
    throw new ApiError(403, "FORBIDDEN", "You are not allowed to access this course.");
  }
}

export function assertModerator(user: AuthenticatedUser): void {
  if (user.role !== "moderator") {
    throw new ApiError(403, "FORBIDDEN", "Moderator access is required.");
  }
}

