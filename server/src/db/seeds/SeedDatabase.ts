import { db, sql } from "@server/db/client";
import { courses, enrollments, posts, savedPosts, users } from "@server/db/schema";
import { seedCourses, seedEnrollments, seedPosts, seedSavedPosts, seedUsers } from "./data";

// Demo seed data is fully reset on every run (delete then insert) rather than
// upserted, so the dataset stays exactly what this file describes and never
// accumulates stale rows from earlier seed revisions. Still idempotent: running
// it any number of times converges on the same end state.
await db.transaction(async (tx) => {
  await tx.delete(savedPosts);
  await tx.delete(posts);
  await tx.delete(enrollments);
  await tx.delete(courses);
  await tx.delete(users);

  await tx.insert(users).values(seedUsers);
  await tx.insert(courses).values(seedCourses);
  await tx.insert(enrollments).values(seedEnrollments);
  await tx.insert(posts).values(seedPosts);
  await tx.insert(savedPosts).values(seedSavedPosts);
});

await sql.end();

console.log("Database seed completed.");
