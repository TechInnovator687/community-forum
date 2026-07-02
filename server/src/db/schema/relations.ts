import { relations } from "drizzle-orm";
import { courses } from "./courses";
import { enrollments } from "./enrollments";
import { posts } from "./posts";
import { savedPosts } from "./saved-posts";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  posts: many(posts),
  savedPosts: many(savedPosts)
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
  posts: many(posts)
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id]
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id]
  })
}));

export const postsRelations = relations(posts, ({ many, one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  }),
  course: one(courses, {
    fields: [posts.courseId],
    references: [courses.id]
  }),
  savedPosts: many(savedPosts)
}));

export const savedPostsRelations = relations(savedPosts, ({ one }) => ({
  user: one(users, {
    fields: [savedPosts.userId],
    references: [users.id]
  }),
  post: one(posts, {
    fields: [savedPosts.postId],
    references: [posts.id]
  })
}));
