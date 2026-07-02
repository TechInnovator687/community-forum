import { sql as drizzleSql } from "drizzle-orm";
import { db, sql } from "@server/db/client";
import { courses, enrollments, posts, users } from "@server/db/schema";
import type { NewCourse, NewEnrollment, NewPost, NewUser } from "@server/db/schema";

const USER_IDS = {
  moderator: "10000000-0000-4000-8000-000000000001",
  studentAva: "10000000-0000-4000-8000-000000000002",
  studentNoah: "10000000-0000-4000-8000-000000000003",
  studentMia: "10000000-0000-4000-8000-000000000004"
} as const;

const COURSE_IDS = {
  webFoundations: "20000000-0000-4000-8000-000000000001",
  databaseSystems: "20000000-0000-4000-8000-000000000002"
} as const;

const POST_IDS = {
  welcomeWeb: "30000000-0000-4000-8000-000000000001",
  cssPatterns: "30000000-0000-4000-8000-000000000002",
  indexes: "30000000-0000-4000-8000-000000000003",
  transactions: "30000000-0000-4000-8000-000000000004"
} as const;

const seedUsers = [
  {
    id: USER_IDS.moderator,
    name: "Morgan Lee",
    email: "moderator@example.com",
    role: "moderator"
  },
  {
    id: USER_IDS.studentAva,
    name: "Ava Patel",
    email: "ava.patel@example.com",
    role: "student"
  },
  {
    id: USER_IDS.studentNoah,
    name: "Noah Kim",
    email: "noah.kim@example.com",
    role: "student"
  },
  {
    id: USER_IDS.studentMia,
    name: "Mia Garcia",
    email: "mia.garcia@example.com",
    role: "student"
  }
] satisfies NewUser[];

const seedCourses = [
  {
    id: COURSE_IDS.webFoundations,
    slug: "web-foundations",
    title: "Web Foundations",
    description: "Core concepts for building accessible, maintainable web applications."
  },
  {
    id: COURSE_IDS.databaseSystems,
    slug: "database-systems",
    title: "Database Systems",
    description: "Relational modeling, indexing, transactions, and query design."
  }
] satisfies NewCourse[];

const seedEnrollments = [
  { userId: USER_IDS.studentAva, courseId: COURSE_IDS.webFoundations },
  { userId: USER_IDS.studentNoah, courseId: COURSE_IDS.webFoundations },
  { userId: USER_IDS.studentNoah, courseId: COURSE_IDS.databaseSystems },
  { userId: USER_IDS.studentMia, courseId: COURSE_IDS.databaseSystems }
] satisfies NewEnrollment[];

const seedPosts = [
  {
    id: POST_IDS.welcomeWeb,
    courseId: COURSE_IDS.webFoundations,
    authorId: USER_IDS.moderator,
    title: "Welcome to Web Foundations",
    content: "Use this space to ask questions about HTML, CSS, accessibility, and browser basics."
  },
  {
    id: POST_IDS.cssPatterns,
    courseId: COURSE_IDS.webFoundations,
    authorId: USER_IDS.studentAva,
    title: "When should I extract a reusable component?",
    content: "I am trying to understand when repetition is enough to justify a new component."
  },
  {
    id: POST_IDS.indexes,
    courseId: COURSE_IDS.databaseSystems,
    authorId: USER_IDS.studentNoah,
    title: "Indexing discussion threads by course",
    content: "Would a composite index on course and created time help discussion listing queries?"
  },
  {
    id: POST_IDS.transactions,
    courseId: COURSE_IDS.databaseSystems,
    authorId: USER_IDS.studentMia,
    title: "Transaction boundaries for enrollment changes",
    content: "What should be included in a transaction when enrollment status changes?"
  }
] satisfies NewPost[];

await db
  .insert(users)
  .values(seedUsers)
  .onConflictDoUpdate({
    target: users.email,
    set: {
      name: drizzleSql`excluded.name`,
      role: drizzleSql`excluded.role`,
      updatedAt: new Date()
    }
  });

await db
  .insert(courses)
  .values(seedCourses)
  .onConflictDoUpdate({
    target: courses.slug,
    set: {
      title: drizzleSql`excluded.title`,
      description: drizzleSql`excluded.description`,
      updatedAt: new Date()
    }
  });

await db
  .insert(enrollments)
  .values(seedEnrollments)
  .onConflictDoNothing({
    target: [enrollments.userId, enrollments.courseId]
  });

await db
  .insert(posts)
  .values(seedPosts)
  .onConflictDoUpdate({
    target: posts.id,
    set: {
      title: drizzleSql`excluded.title`,
      content: drizzleSql`excluded.content`,
      updatedAt: new Date()
    }
  });

await sql.end();

console.log("Database seed completed.");
