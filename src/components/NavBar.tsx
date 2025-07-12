"use client";

import {useSession} from "next-auth/react";
import Link from "next/link";

export default function NavBar() {
  const {data: session} = useSession();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600 dark:text-blue-400"
        >
          HyperTrofy
        </Link>

        {/* Nav Links */}
        <nav>
          <ul className="flex space-x-6 text-gray-700 dark:text-gray-200 font-medium">
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
                  <Link href="/workouts/new">New Workout</Link>
                </li>
                <li>
                  <Link href="/workouts">My Workouts</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
