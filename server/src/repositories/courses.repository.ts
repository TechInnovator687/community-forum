import { eq } from "drizzle-orm";
import { db } from "@server/db/client";
import { courses, type Course } from "@server/db/schema";

type Database = typeof db;

export function createCoursesRepository(database: Database = db) {
  return {
    async findById(id: string): Promise<Course | null> {
      const [course] = await database.select().from(courses).where(eq(courses.id, id)).limit(1);

      return course ?? null;
    },

    async findBySlug(slug: string): Promise<Course | null> {
      const [course] = await database.select().from(courses).where(eq(courses.slug, slug)).limit(1);

      return course ?? null;
    }
  };
}

export const coursesRepository = createCoursesRepository();

