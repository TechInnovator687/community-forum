import { sql } from "drizzle-orm";
import { index, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { posts } from "./posts";
import { users } from "./users";

export const savedPosts = pgTable(
  "saved_posts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date())
  },
  (table) => [
    uniqueIndex("saved_posts_user_post_unique").on(table.userId, table.postId),
    uniqueIndex("saved_posts_active_user_post_unique")
      .on(table.userId, table.postId)
      .where(sql`${table.deletedAt} is null`),
    index("saved_posts_user_id_idx").on(table.userId),
    index("saved_posts_post_id_idx").on(table.postId),
    index("saved_posts_deleted_at_idx").on(table.deletedAt)
  ],
);

export type SavedPost = typeof savedPosts.$inferSelect;
export type NewSavedPost = typeof savedPosts.$inferInsert;
