"use client";

import {useSession} from "next-auth/react";
import {useRouter, useParams} from "next/navigation";
import {useEffect, useState} from "react";
import AddExerciseForm from "@/components/AddExerciseForm";
import Timer from "@/components/Timer";
import ExerciseCard from "@/components/ExerciseCard";

interface Set {
  _id: string;
  reps: number;
  weight: number;
}

interface Exercise {
  _id: string;
  name: string;
  muscle: string;
  equipment: string;
  sets?: Set[];
}

export default function IndividualWorkoutPage() {
  const router = useRouter();
  const {data: session, status} = useSession();
  const params = useParams();
  const workoutId = params?.id as string;

  const [workout, setWorkout] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!session && status !== "loading") {
      router.replace("/api/auth/signin");
    }
  }, [session, status]);

  // Fetch workout details
  const fetchWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}`);
      if (!res.ok) throw new Error("Failed to fetch workout");
      const data = await res.json();
      setWorkout(data);
    } catch (err) {
      console.error("Error fetching workout:", err);
    }
  };

  useEffect(() => {
    if (workoutId) fetchWorkout();
  }, [workoutId]);

  if (status === "loading" || !session) return null;

  // Delete exercise handler
  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      const res = await fetch(
        `/api/workouts/${workoutId}/exercises/${exerciseId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete exercise");
      }

      // Update state locally
      setWorkout((prev: any) => ({
        ...prev,
        exercises: prev.exercises.filter(
          (exercise: Exercise) => exercise._id !== exerciseId
        ),
      }));
    } catch (error: any) {
      alert("Error deleting exercise: " + error.message);
      console.error(error);
    }
  };

  return (
    <div className="p-4 text-center">
      <Timer />

      {Array.isArray(workout?.exercises) && workout.exercises.length > 0 && (
        <div className="mt-6 text-left">
          <h3 className="text-lg font-semibold mb-2">
            Exercises in This Workout:
          </h3>
          <ul className="bg-white text-black p-4 rounded shadow-md">
            {workout.exercises.map((exercise: Exercise, index: number) => (
              <ExerciseCard
                key={exercise._id || index}
                exercise={exercise}
                workoutId={workoutId}
                onDelete={handleDeleteExercise}
                onSetAdded={fetchWorkout} // ✅ refresh after adding a set
              />
            ))}
          </ul>
        </div>
      )}

      <AddExerciseForm
        workoutId={workoutId}
        session={session}
        onWorkoutUpdate={setWorkout} // ✅ update workout after adding exercises
      />
    </div>
  );
}
