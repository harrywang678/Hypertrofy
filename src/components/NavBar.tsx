"use client";
import {useSession} from "next-auth/react";
import Link from "next/link";

export default function NavBar() {
  const {data: session} = useSession();

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <h1 className="text-2xl font-bold">Liftly</h1>
      <nav className="mt-2">
        <ul className="flex gap-4">
          <li>
            <Link href="/">Home</Link>
          </li>

          {/* Show these only if no session */}
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

          {/* Example: You could show this if session exists */}
          {session && (
            <li>
              <Link href="/dashboard">Dashboard</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
