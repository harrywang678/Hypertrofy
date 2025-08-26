import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";

export const useAuth = (redirectTo: string = "/user/login") => {
  const {data: session, status} = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!session;

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(redirectTo);
    }

    setLoading(false);
  }, [isAuthenticated, router, redirectTo]);

  return {
    session,
    loading,
    isAuthenticated,
    user: session?.user,
  };
};
