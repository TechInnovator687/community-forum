import { and, eq } from "drizzle-orm";
import { db } from "@server/db/client";
import { courses, enrollments, type Course, type Enrollment } from "@server/db/schema";

type Database = typeof db;

export type EnrollmentWithCourse = {
  enrollment: Enrollment;
  course: Course;
};

export function createEnrollmentsRepository(database: Database = db) {
  return {
    async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
      const [enrollment] = await database
        .select({ id: enrollments.id })
        .from(enrollments)
        .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)))
        .limit(1);

      return enrollment !== undefined;
    },

    async getUserEnrollments(userId: string): Promise<EnrollmentWithCourse[]> {
      return database
        .select({
          enrollment: enrollments,
          course: courses
        })
        .from(enrollments)
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(enrollments.userId, userId))
        .orderBy(courses.title);
    }
  };
}

export const enrollmentsRepository = createEnrollmentsRepository();

