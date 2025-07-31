"use client";

import {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";

interface ExerciseInput {
  exerciseId: string;
  name: string;
  sets: number;
}

function UpdateRoutine() {
  const {id} = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<ExerciseInput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch routine by ID
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        const res = await fetch(`/api/routines/${id}`);
        if (!res.ok) throw new Error("Failed to load routine.");
        const data = await res.json();
        setName(data.name);
        setExercises(
          data.exercises.map((ex: any) => ({
            exerciseId: ex.exerciseId || ex._id,
            name: ex.name,
            sets: ex.sets?.length || 3,
          }))
        );
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchRoutine();
  }, [id]);

  // Update handler
  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/routines/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name, exercises}),
      });

      if (!res.ok) throw new Error("Failed to update routine");

      router.push("/routines");
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return <div></div>;
}

export default UpdateRoutine;
