import { and, count, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@server/db/client";
import {
  courses,
  posts,
  savedPosts,
  users,
  type Course,
  type NewSavedPost,
  type Post,
  type SavedPost,
  type User
} from "@server/db/schema";

type Database = typeof db;

export type SavedPostsPagination = {
  limit: number;
  offset: number;
};

export type SavedPostWithPost = {
  savedPost: SavedPost;
  post: Post;
  author: User;
  course: Course;
};

export type PostSaveCount = {
  postId: string;
  saveCount: number;
};

export function createSavedPostsRepository(database: Database = db) {
  return {
    async findByUserAndPost(userId: string, postId: string): Promise<SavedPost | null> {
      const [savedPost] = await database
        .select()
        .from(savedPosts)
        .where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)))
        .limit(1);

      return savedPost ?? null;
    },

    async create(values: NewSavedPost): Promise<SavedPost> {
      const [savedPost] = await database.insert(savedPosts).values(values).returning();

      if (!savedPost) {
        throw new Error("Saved post insert did not return a row.");
      }

      return savedPost;
    },

    async reactivate(userId: string, postId: string): Promise<SavedPost | null> {
      const [savedPost] = await database
        .update(savedPosts)
        .set({
          deletedAt: null,
          savedAt: new Date(),
          updatedAt: new Date()
        })
        .where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)))
        .returning();

      return savedPost ?? null;
    },

    async softDelete(userId: string, postId: string): Promise<SavedPost | null> {
      const [savedPost] = await database
        .update(savedPosts)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId), isNull(savedPosts.deletedAt)),
        )
        .returning();

      return savedPost ?? null;
    },

    async getSavedPosts(
      userId: string,
      pagination: SavedPostsPagination,
    ): Promise<SavedPostWithPost[]> {
      return database
        .select({
          savedPost: savedPosts,
          post: posts,
          author: users,
          course: courses
        })
        .from(savedPosts)
        .innerJoin(posts, eq(savedPosts.postId, posts.id))
        .innerJoin(users, eq(posts.authorId, users.id))
        .innerJoin(courses, eq(posts.courseId, courses.id))
        .where(and(eq(savedPosts.userId, userId), isNull(savedPosts.deletedAt)))
        .orderBy(desc(savedPosts.savedAt))
        .limit(pagination.limit)
        .offset(pagination.offset);
    },

    async countSavedPosts(userId: string): Promise<number> {
      const [result] = await database
        .select({ value: count() })
        .from(savedPosts)
        .where(and(eq(savedPosts.userId, userId), isNull(savedPosts.deletedAt)));

      return result?.value ?? 0;
    },

    async getSaveCountForPost(postId: string): Promise<number> {
      const [result] = await database
        .select({ value: count() })
        .from(savedPosts)
        .where(and(eq(savedPosts.postId, postId), isNull(savedPosts.deletedAt)));

      return result?.value ?? 0;
    },

    async getSaveCountsForPosts(postIds: string[]): Promise<PostSaveCount[]> {
      if (postIds.length === 0) {
        return [];
      }

      return database
        .select({
          postId: savedPosts.postId,
          saveCount: count()
        })
        .from(savedPosts)
        .where(and(inArray(savedPosts.postId, postIds), isNull(savedPosts.deletedAt)))
        .groupBy(savedPosts.postId);
    },

    async hasUserSavedPost(userId: string, postId: string): Promise<boolean> {
      const [savedPost] = await database
        .select({ id: savedPosts.id })
        .from(savedPosts)
        .where(
          and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId), isNull(savedPosts.deletedAt)),
        )
        .limit(1);

      return savedPost !== undefined;
    },

    async hasUserSavedPosts(userId: string, postIds: string[]): Promise<Record<string, boolean>> {
      if (postIds.length === 0) {
        return {};
      }

      const rows = await database
        .select({ postId: savedPosts.postId })
        .from(savedPosts)
        .where(
          and(eq(savedPosts.userId, userId), inArray(savedPosts.postId, postIds), isNull(savedPosts.deletedAt)),
        );

      const savedPostIds = new Set(rows.map((row) => row.postId));

      return Object.fromEntries(postIds.map((postId) => [postId, savedPostIds.has(postId)]));
    }
  };
}

export const savedPostsRepository = createSavedPostsRepository();
