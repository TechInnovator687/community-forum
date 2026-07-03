import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints, apiRequest, type ApiAuth } from "@/lib/api";
import {
  invalidatePostCaches,
  markPostUnsaved,
  prepareSaveMutation,
  restoreMutationSnapshot
} from "./cache-updates";

export type UnsavePostVariables = {
  auth: ApiAuth;
  postId: string;
};

export function useUnsavePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ auth, postId }: UnsavePostVariables) =>
      apiRequest(apiEndpoints.savePost(postId), {
        auth,
        method: "DELETE"
      }),
    onMutate: async ({ auth, postId }) => {
      const snapshot = await prepareSaveMutation(queryClient);

      markPostUnsaved(queryClient, postId, auth);

      return snapshot;
    },
    onError: (_error, _variables, snapshot) => {
      restoreMutationSnapshot(queryClient, snapshot);
    },
    onSettled: () => invalidatePostCaches(queryClient)
  });
}

