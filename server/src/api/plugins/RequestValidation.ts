import { z, type ZodTypeAny } from "zod";
import { MAX_PAGE_SIZE } from "@server/services/PaginationService";
import { ApiError } from "./ErrorHandlerPlugin";

export const idParamSchema = z.object({
  courseId: z.string().uuid().optional(),
  postId: z.string().uuid().optional()
});

export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).optional()
  })
  .transform((query) => ({
    ...(query.page === undefined ? {} : { page: query.page }),
    ...(query.pageSize === undefined ? {} : { pageSize: query.pageSize })
  }));

export function parseRequest<TSchema extends ZodTypeAny>(
  schema: TSchema,
  value: unknown,
): z.infer<TSchema> {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiError(400, "VALIDATION_ERROR", "Request validation failed.", result.error.flatten());
  }

  return result.data as z.infer<TSchema>;
}
