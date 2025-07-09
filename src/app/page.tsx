"use client";

import {useSession, signIn, signOut} from "next-auth/react";
import {useEffect, useState} from "react";

export default function Home() {
  const {data: session} = useSession();
  const [mongoUserId, setMongoUserId] = useState("");

  useEffect(() => {
    const fetchMongoUserId = async () => {
      if (!session?.user?.email) return;

      try {
        const res = await fetch("/api/users/by-email", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({email: session.user.email}),
        });

        const data = await res.json();
        if (res.ok && data.user) {
          setMongoUserId(data.user._id);
        } else {
          console.error(data.error || "Failed to fetch Mongo user ID");
        }
      } catch (err) {
        console.error("Failed to fetch Mongo user ID:", err);
      }
    };

    fetchMongoUserId();
  }, [session]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Liftly</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Your personalized workout tracker.
        </p>

        {session ? (
          <div className="space-y-3">
            <p className="text-xl">
              Hello, <span className="font-semibold">{session.user?.name}</span>
              !
            </p>
            <p>
              Email:{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {session.user?.email}
              </span>
            </p>
            <p>
              User ID:{" "}
              <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                {mongoUserId}
              </code>
            </p>
            <button
              onClick={() => signOut()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg">You are not signed in.</p>
            <button
              onClick={() => signIn("google")}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              Sign In with Google
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
