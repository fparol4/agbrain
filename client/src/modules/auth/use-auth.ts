import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, login as loginRequest, logout as logoutRequest } from "./api";
import type { LoginInput, User } from "./model";

export const authQueryKey = ["session"] as const;

export function useAuth() {
  const queryClient = useQueryClient();
  const session = useQuery<User | null>({
    queryKey: authQueryKey,
    queryFn: async () => {
      try {
        return await getSession();
      } catch {
        return null;
      }
    },
    staleTime: Number.POSITIVE_INFINITY,
  });

  const login = async (input: LoginInput) => {
    const user = await loginRequest(input);
    queryClient.setQueryData(authQueryKey, user);
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Local session state must still be cleared when the server is unavailable.
    } finally {
      queryClient.setQueryData(authQueryKey, null);
    }
  };

  return {
    user: session.data ?? null,
    loading: session.isPending,
    login,
    logout,
  };
}
