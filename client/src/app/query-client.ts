import {
  MutationCache,
  QueryCache,
  QueryClient,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { authQueryKey } from "@/modules/auth/use-auth";
import { ApiError } from "@/shared/api/client";

function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

const config: QueryClientConfig = {
  queryCache: new QueryCache({
    onError: (error) => {
      if (isUnauthorized(error)) queryClient.setQueryData(authQueryKey, null);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (isUnauthorized(error)) queryClient.setQueryData(authQueryKey, null);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 1,
      refetchOnWindowFocus: false,
    },
  },
};

export const queryClient = new QueryClient(config);
