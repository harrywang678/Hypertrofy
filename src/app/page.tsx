"use client";

import {useSession, signIn, signOut} from "next-auth/react";
import {useEffect} from "react";

export default function Home() {
  const {data: session} = useSession();

  return (
    <div>
      <div>This is The Home Page.</div>
      <h2> Sign in With Google</h2>
      {session?.user?.name ? (
        <h1> Welcome {session.user.name} </h1>
      ) : (
        <h1> You are not logged in (jayden is gay).</h1>
      )}
      <button onClick={() => signIn("google")}> Sign In</button>
      <br></br>
      <button onClick={() => signOut()}> Sign Out</button>
    </div>
  );
}
