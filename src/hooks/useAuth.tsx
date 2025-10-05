import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export const useAuth = (redirectTo: string = "/user/login") => {
  const {data: session, status} = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait until NextAuth finishes loading
    if (status === "loading") {
      setLoading(true);
      return;
    }

    // Once loaded, check authentication
    if (status === "unauthenticated") {
      router.replace(redirectTo);
    }

    setLoading(false);
  }, [status, router, redirectTo]);

  return {
    session,
    loading,
    isAuthenticated: !!session,
    user: session?.user,
  };
};
