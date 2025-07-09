"use client";

import {useSession} from "next-auth/react";
import {useEffect, useState} from "react";
import {useRouter, useParams} from "next/navigation";
import AddExerciseForm from "@/components/AddExerciseForm";
import Timer from "@/components/Timer";
import ExerciseCard from "@/components/ExerciseCard";

interface Set {
  _id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

interface Exercise {
  _id: string;
  name: string;
  muscle: string;
  equipment: string;
  sets?: Set[];
  finished: boolean;
}

export default function IndividualWorkoutPage() {
  const router = useRouter();
  const {data: session, status} = useSession();
  const params = useParams();
  const workoutId = params?.id as string;

  const [timerResetSignal, setTimerResetSignal] = useState(0);
  const [workout, setWorkout] = useState<any>(null);

  useEffect(() => {
    if (!session && status !== "loading") {
      router.replace("/api/auth/signin");
    }
  }, [session, status]);

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

  const handleSetComplete = () => {
    setTimerResetSignal((prev) => prev + 1);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      const res = await fetch(
        `/api/workouts/${workoutId}/exercises/${exerciseId}`,
        {method: "DELETE"}
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete exercise");
      }

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

  const handleFinishWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}/finish`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to finish workout");
      }

      fetchWorkout();
    } catch (e: any) {
      console.error(e);
      alert("Failed to finish workout");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!workout?.finished && (
        <div className="mb-8">
          <Timer resetSignal={timerResetSignal} />
        </div>
      )}

      {Array.isArray(workout?.exercises) && workout.exercises.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Exercises in This Workout
          </h2>
          <ul className="space-y-6">
            {workout.exercises.map((exercise: Exercise) => (
              <ExerciseCard
                key={exercise._id}
                exercise={exercise}
                workoutId={workoutId}
                onDelete={handleDeleteExercise}
                onSetAdded={fetchWorkout}
                finished={workout?.finished}
                onSetComplete={handleSetComplete}
              />
            ))}
          </ul>
        </section>
      )}

      {!workout?.finished && (
        <>
          <AddExerciseForm
            workoutId={workoutId}
            session={session}
            onWorkoutUpdate={setWorkout}
          />

          <div className="mt-8 text-center">
            <button
              onClick={handleFinishWorkout}
              className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
            >
              Finish Workout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
