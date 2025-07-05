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
          // store the MongoDB user ID
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
    <div>
      <div>This is The Home Page.</div>
      <h2> Sign in With Google</h2>
      {session?.user?.name ? (
        <>
          <h1> Welcome {session.user.name} </h1>
          <h1> Your ID is {mongoUserId}</h1>
          <h1> Your Email is {session?.user?.email} </h1>
        </>
      ) : (
        <h1> You are not logged in (jayden is gay).</h1>
      )}
      <button onClick={() => signIn("google")}> Sign In</button>
      <br></br>
      <button onClick={() => signOut()}> Sign Out</button>
    </div>
  );
}
