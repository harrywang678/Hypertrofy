import {useSession} from "next-auth/react";
import {useEffect} from "react";
import {useRouter} from "next/navigation";

export const useAuth = (redirectTo: string = "/api/auth/signin") => {
  const {data: session, status} = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = !!session;

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return {
    session,
    isLoading,
    isAuthenticated,
    user: session?.user,
  };
};
