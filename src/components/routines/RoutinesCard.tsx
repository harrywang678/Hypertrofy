"use client";
import {Routine} from "@/types/workout";
import {useRouter} from "next/navigation";
import Link from "next/link";

interface RoutineCardProps {
  routines: Routine[];
  userId: string;
  setRoutines: (routine: any) => void;
}

export default function RoutinesCard({
  routines,
  userId,
  setRoutines,
}: RoutineCardProps) {
  const router = useRouter();
  const handleStartWorkout = async (routine: Routine) => {
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          name: routine.name,
          notes: "",
          routineId: routine._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Workout creation failed");

      console.log(data);

      const workoutId = data.workout._id;

      router.push(`/workouts/${workoutId}`);
    } catch (e) {
      console.error("Error starting workout:", e);
    }
  };

  const handleDeleteRoutine = async (routine: Routine) => {
    try {
      const res = await fetch(`/api/routines/${routine._id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Workout creation failed");

      setRoutines((prev: any) =>
        prev.filter((currRoutine: any) => currRoutine._id !== routine._id)
      );
    } catch (e) {
      alert(`${e}`);
    }
  };

  return (
    <div>
      {routines.map((routine) => (
        <span
          key={routine._id.toString()}
          className="block mb-4 p-4 border rounded"
        >
          <h2>{routine.name}</h2>
          <ul>
            {routine.exercises.map((exercise, i) => (
              <li key={i}>
                {exercise.name} - {exercise.sets?.length || 3} sets
              </li>
            ))}
          </ul>
          <span>
            <button
              className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
              onClick={() => handleStartWorkout(routine)}
            >
              Start Workout
            </button>
            <button onClick={() => handleDeleteRoutine(routine)}>
              Delete Routine
            </button>

            <Link href={`/routines/${routine._id}`}>
              <button> Edit Routine </button>
            </Link>
          </span>
        </span>
      ))}
    </div>
  );
}
