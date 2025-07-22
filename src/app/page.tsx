"use client";

import {useSession, signIn, signOut} from "next-auth/react";
import {useEffect, useState} from "react";
import Link from "next/link";

const getActiveWorkout = async () => {
  const response = await fetch('/api/workouts/unfinished');
  const unfinishedWorkout = await response.json();
  return unfinishedWorkout;
};

export default function Home() {
  const {data: session} = useSession();
  const [activeWorkout, setActiveWorkout] = useState<any>(null);

  useEffect(() => {
    const fetchActiveWorkout = async () => {
      const activeWorkout = await getActiveWorkout();
      setActiveWorkout(activeWorkout);
    };
    fetchActiveWorkout();
  }, [session]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to HyperTrofy</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Your personalized workout tracker.
        </p>

        {session ? (
          <div className="space-y-3">
            <p className="text-xl">
              Hello, <span className="font-semibold">{session.user?.name}</span>
              !
            </p>

            <div className="space-y-2">
              {activeWorkout?._id ? (
                <Link href={`/workouts/${activeWorkout._id}`} className="block hover:bg-blue-100 dark:hover:bg-blue-900 rounded p-2 transition">
                  <h2 className="text-xl font-bold"> Current Active Workout </h2> 
                    <p>
                      <span className="font-semibold">Workout Name:</span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {activeWorkout?.name || "No active workout"}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Workout Notes:</span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {activeWorkout?.notes || "No notes available"}
                      </span>
                    </p>
                </Link>
              ) : (
                <Link href="/workouts/new" className="block hover:bg-blue-100 dark:hover:bg-blue-900 rounded p-2 transition">
                  <h2 className="text-xl font-bold"> Create a New Workout </h2>
                </Link>
              )}
            </div>

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
