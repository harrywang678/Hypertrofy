"use client";

import {useEffect, useState} from "react";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import AddExerciseForm from "@/components/AddExerciseForm";

export default function NewRoutinePage() {
  const {data: session, status} = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routineName, setRoutineName] = useState("");
  const [defaultExercises, setDefaultExercises] = useState([]);

  useEffect(() => {
    if (!session && status !== "loading") {
      router.replace("/api/auth/signin");
    }
  }, [session, status]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch("/api/exercises?default=true");
        if (!res.ok) throw new Error("Failed to fetch exercises.");
        const data = await res.json();
        setDefaultExercises(data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    fetchExercises();
  }, []);

  const handleSubmitCreateRoutine = async (event: React.FormEvent) => {};

  //   if (loading) {
  //     return <div>Loading...</div>;
  //   }

  if (error) {
    return;
    <div>Error: {error}</div>;
  } else {
    return (
      <div>
        <AddExerciseForm />
      </div>
    );
  }
}
