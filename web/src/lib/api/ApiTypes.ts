export type UserRole = "student" | "moderator";

export type ApiAuth = {
  userId: string;
  role: UserRole;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type PaginatedApiResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type ApiEntity = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type User = ApiEntity & {
  name: string;
  email: string;
  role: UserRole;
};

export type Course = ApiEntity & {
  slug: string;
  title: string;
  description: string | null;
};

export type Post = ApiEntity & {
  courseId: string;
  authorId: string;
  title: string;
  content: string;
};

export type SavedPost = ApiEntity & {
  userId: string;
  postId: string;
  savedAt: string;
  deletedAt: string | null;
};

export type HydratedPost = {
  post: Post;
  author: User;
  course: Course;
  hasSaved: boolean;
  savesCount: number;
};

export type HydratedSavedPost = {
  savedPost: SavedPost;
  post: Post;
  author: User;
  course: Course;
  hasSaved: true;
  savesCount: number;
};

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: ApiAuth;
  body?: unknown;
};

