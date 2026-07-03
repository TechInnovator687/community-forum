import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEndpoints, apiRequest, type ApiAuth } from "@/lib/api";
import {
  invalidatePostCaches,
  markPostSaved,
  prepareSaveMutation,
  restoreMutationSnapshot
} from "./cache-updates";

export type SavePostVariables = {
  auth: ApiAuth;
  postId: string;
};

export function useSavePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ auth, postId }: SavePostVariables) =>
      apiRequest(apiEndpoints.savePost(postId), {
        auth,
        method: "POST"
      }),
    onMutate: async ({ auth, postId }) => {
      const snapshot = await prepareSaveMutation(queryClient);

      markPostSaved(queryClient, postId, auth);

      return snapshot;
    },
    onError: (_error, _variables, snapshot) => {
      restoreMutationSnapshot(queryClient, snapshot);
    },
    onSettled: () => invalidatePostCaches(queryClient)
  });
}

