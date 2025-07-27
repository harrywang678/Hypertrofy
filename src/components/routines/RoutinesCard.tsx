"use client";
import {Routine} from "@/types/workout";
import {useRouter} from "next/navigation"; 

interface RoutineCardProps {
  routines: Routine[];
  userId: string; 
}

export default function RoutinesCard({routines, userId}: RoutineCardProps) {
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
          </span>
        </span>
      ))}
    </div>
  );
}
