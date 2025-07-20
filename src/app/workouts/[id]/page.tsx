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
  const router = useRouter(); // Router for navigation
  const {data: session, status} = useSession(); // Session data from NextAuth
  const params = useParams(); // Get URL parameters
  const workoutId = params?.id as string; // Extract workout ID from URL parameters

  const [timerResetSignal, setTimerResetSignal] = useState(0); // Timer for Complete Set
  const [workout, setWorkout] = useState<any>(null); // Current Workout Data
  const [showAddExerciseForm, setshowAddExerciseForm] = useState(false); // Toggle for Add Exercise Form
  const [defaultExercises, setDefaultExercises] = useState<Exercise[]>([]); // Default Exercises for Form
  const [elapsedDuration, setElapsedDuration] = useState(0); // Elapsed Duration for Workout
  const [loading, setLoading] = useState(true); // Loading State
  const [error, setError] = useState<string | null>(null); // Error State
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (!session && status !== "loading") {
      router.replace("/api/auth/signin");
    }
  }, [session, status]);

  // Fetch the workout data from the API
  const fetchWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}`);
      if (!res.ok) throw new Error("Failed to fetch workout");
      const data = await res.json();
      setWorkout(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load workout");
      setLoading(false);
      console.error("Error fetching workout:", err);
    }
  };

  // Fetch workout data when component mounts or workoutId changes
  useEffect(() => {
    if (workoutId) fetchWorkout();
  }, [workoutId]);

  const handleSetComplete = () => {
    setTimerResetSignal((prev) => prev + 1);
  };

  // Fetch default exercises for the Add Exercise Form
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch("/api/exercises?default=true");
        if (!res.ok) throw new Error("Failed to fetch exercises.");
        const data = await res.json();
        console.log("Default Exercises:", data);
        setDefaultExercises(data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    fetchExercises();
  }, []);

  // Handle deletion of the workout
  const handleDeleteWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete workout");
      }

      alert("Workout deleted successfully");
      router.push("/");
    } catch (e: any) {
      console.error("Error deleting workout:", e);
      alert("Failed to delete workout: " + e.message);
    }
  };

  // Handle deletion of an exercise
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

  // Handle finishing the workout
  const handleFinishWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}/finish`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({duration: elapsedDuration}),
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

  // Check if there are any incomplete sets in the workout
  const hasIncompleteSets = workout?.exercises?.some((exercise: Exercise) =>
    exercise.sets?.some((set) => !set.completed)
  );

  // If loading, show a loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  // If there's an error, show an error message
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // Render the workout page
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!workout?.finished && (
        <div className="mb-8">
          <Timer
            resetSignal={timerResetSignal}
            onDurationUpdate={(seconds) => setElapsedDuration(seconds)}
          />
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
        <button
          className="mb-6 w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium py-2 px-4 rounded transition"
          onClick={() => setshowAddExerciseForm(!showAddExerciseForm)}
        >
          {showAddExerciseForm ? "Hide Form" : "Add New Workout"}
        </button>
      )}

      {!workout?.finished && showAddExerciseForm && (
        <>
          <AddExerciseForm
            workoutId={workoutId}
            onWorkoutUpdate={setWorkout}
            setshowAddExerciseForm={setshowAddExerciseForm}
            defaultExercises={defaultExercises}
            addFormWorkout={true}
            selectedExercises={selectedExercises}
            setSelectedExercises={setSelectedExercises}
          />
        </>
      )}

      {!workout?.finished && (
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handleDeleteWorkout}
            className="bg-red-800 text-white px-6 py-2 rounded hover:bg-red-700 transition"
          >
            {" "}
            Discard Workout{" "}
          </button>
          <button
            disabled={hasIncompleteSets}
            onClick={handleFinishWorkout}
            className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
          >
            Finish Workout
          </button>
        </div>
      )}
    </div>
  );
}
