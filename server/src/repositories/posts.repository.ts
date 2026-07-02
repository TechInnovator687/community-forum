import { count, desc, eq } from "drizzle-orm";
import { db } from "@server/db/client";
import {
  courses,
  posts,
  savedPosts,
  users,
  type Course,
  type NewPost,
  type Post,
  type User
} from "@server/db/schema";

type Database = typeof db;

export type FeedPagination = {
  limit: number;
  offset: number;
};

export type PostWithAuthorAndCourse = {
  post: Post;
  author: User;
  course: Course;
};

export type FeedPost = PostWithAuthorAndCourse & {
  saveCount: number;
};

export function createPostsRepository(database: Database = db) {
  return {
    async findById(id: string): Promise<PostWithAuthorAndCourse | null> {
      const [post] = await database
        .select({
          post: posts,
          author: users,
          course: courses
        })
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .innerJoin(courses, eq(posts.courseId, courses.id))
        .where(eq(posts.id, id))
        .limit(1);

      return post ?? null;
    },

    async findFeedByCourse(courseId: string, pagination: FeedPagination): Promise<FeedPost[]> {
      return database
        .select({
          post: posts,
          author: users,
          course: courses,
          saveCount: count(savedPosts.id)
        })
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .innerJoin(courses, eq(posts.courseId, courses.id))
        .leftJoin(savedPosts, eq(savedPosts.postId, posts.id))
        .where(eq(posts.courseId, courseId))
        .groupBy(posts.id, users.id, courses.id)
        .orderBy(desc(posts.createdAt))
        .limit(pagination.limit)
        .offset(pagination.offset);
    },

    async countFeed(courseId: string): Promise<number> {
      const [result] = await database
        .select({ value: count() })
        .from(posts)
        .where(eq(posts.courseId, courseId));

      return result?.value ?? 0;
    },

    async create(values: NewPost): Promise<Post> {
      const [post] = await database.insert(posts).values(values).returning();

      if (!post) {
        throw new Error("Post insert did not return a row.");
      }

      return post;
    },

    async delete(id: string): Promise<Post | null> {
      const [post] = await database.delete(posts).where(eq(posts.id, id)).returning();

      return post ?? null;
    }
  };
}

export const postsRepository = createPostsRepository();

