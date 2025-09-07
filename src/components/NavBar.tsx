"use client";

import {useState} from "react";
import {useSession} from "next-auth/react";
import Link from "next/link";
import {useCurrentWorkout} from "@/hooks/useCurrentWorkout";

export default function NavBar() {
  const {data: session} = useSession();
  const {latestWorkout, isLoading, handleDiscardWorkout, handleResumeWorkout} =
    useCurrentWorkout(session);

  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <header className="">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
          HyperTrofy
        </Link>

        {/* Nav Links */}
        <nav>
          <ul className="flex space-x-6 font-medium">
            <li>
              <Link href="/">Home</Link>
            </li>

            {!session && (
              <>
                <li>
                  <Link href="/user/login">Login</Link>
                </li>
                <li>
                  <Link href="/user/signup">Sign Up</Link>
                </li>
              </>
            )}

            {session && (
              <>
                <li>
                  {/* Instead of direct link, open prompt if workout exists */}
                  <button
                    onClick={() => {
                      if (latestWorkout) {
                        setShowPrompt(true);
                      } else {
                        window.location.href = "/workouts/new";
                      }
                    }}
                    className="hover:underline"
                  >
                    New Workout
                  </button>
                </li>
                <li>
                  <Link href="/workouts">My Workouts</Link>
                </li>
                <li>
                  <Link href="/routines/new">New Routine</Link>
                </li>
                <li>
                  <Link href="/routines">My Routines</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              You have an unfinished workout
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Would you like to resume your last workout or discard it?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() =>
                  (window.location.href = `/workouts/${latestWorkout._id}`)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
              >
                Resume
              </button>
              <button
                onClick={async () => {
                  // Call API to discard
                  handleDiscardWorkout;
                  setShowPrompt(false);
                  window.location.href = "/workouts/new";
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
              >
                Discard
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
