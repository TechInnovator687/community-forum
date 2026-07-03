import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints, apiRequest, type ApiAuth } from "@/lib/api";
import { invalidatePostCaches } from "./cache-updates";

export type DeletePostVariables = {
  auth: ApiAuth;
  postId: string;
};

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ auth, postId }: DeletePostVariables) =>
      apiRequest(apiEndpoints.deletePost(postId), {
        auth,
        method: "DELETE"
      }),
    onSuccess: () => invalidatePostCaches(queryClient)
  });
}
