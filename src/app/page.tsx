"use client";

import {signIn, signOut} from "next-auth/react";
import {useEffect, useState, useCallback} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";

export default function Home() {
  const {session} = useAuth();
  const [latestWorkout, setLatestWorkout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchLatestWorkout = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/workouts/latest-unfinished");

      if (res.ok) {
        const data = await res.json();
        setLatestWorkout(data);
      } else if (res.status === 404) {
        // No unfinished workout found
        setLatestWorkout(null);
      } else {
        const errorData = await res.json();
        console.error("API error:", errorData);
        setLatestWorkout(null);
      }
    } catch (err) {
      console.error("Error fetching workout:", err);
      setLatestWorkout(null);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchLatestWorkout();
  }, [fetchLatestWorkout]);

  // Auto-refresh when user navigates back to the page
  useEffect(() => {
    const handleFocus = () => {
      fetchLatestWorkout();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchLatestWorkout();
      }
    };

    // Refresh when window gains focus (user switches back to tab)
    window.addEventListener("focus", handleFocus);
    // Refresh when tab becomes visible (user switches back to tab)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchLatestWorkout]);

  const handleResumeWorkout = () => {
    if (latestWorkout?._id) {
      router.push(`/workouts/${latestWorkout._id}`);
    }
  };

  const handleDiscardWorkout = async () => {
    if (!latestWorkout?._id) return;

    try {
      const res = await fetch(`/api/workouts/${latestWorkout._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLatestWorkout(null);
        alert("Workout discarded successfully");
      } else {
        const errorData = await res.json();
        alert(`Error discarding workout: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Error discarding workout:", err);
      alert("Failed to discard workout");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to HyperTrofy</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Your personalized workout tracker.
        </p>

        {session ? (
          <div className="space-y-4">
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
                {session.user?.id || "Not available"}
              </code>
            </p>

            <div className="justify-center gap-4 flex flex-wrap">
              {!isLoading && !latestWorkout && (
                <button
                  onClick={() => router.push("/workouts/new")}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-lg"
                >
                  Start New Workout
                </button>
              )}
              <button
                onClick={() => signOut()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-lg"
              >
                Sign Out
              </button>
            </div>
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

      {session && latestWorkout && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t-2 border-green-500 shadow-lg p-4 z-50">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-pulse flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading workout...
                  </span>
                </div>
              </div>
            ) : latestWorkout ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      WORKOUT IN PROGRESS
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {latestWorkout.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {latestWorkout.exercises?.length || 0} exercises • Started{" "}
                      {new Date(latestWorkout.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="sm:hidden">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      {latestWorkout.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResumeWorkout}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
                  >
                    Resume
                  </button>
                  <button
                    onClick={handleDiscardWorkout}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm"
                    title="Discard workout"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add padding to prevent content from being hidden behind fixed bottom bar */}
      {session && (latestWorkout || isLoading) && <div className="h-20"></div>}
    </main>
  );
}
