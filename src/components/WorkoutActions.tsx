"use client";
import {useRouter} from "next/navigation";

interface WorkoutActionsProps {
  workoutId: string;
  hasIncompleteSets: boolean;
  onFinish: () => void;
}

export default function WorkoutActions({
  workoutId,
  hasIncompleteSets,
  onFinish,
}: WorkoutActionsProps) {
  const router = useRouter();

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

  return (
    <div className="mt-8 flex justify-center space-x-4">
      <button
        onClick={handleDeleteWorkout}
        className="bg-red-800 text-white px-6 py-2 rounded hover:bg-red-700 transition"
      >
        Discard Workout
      </button>
      <button
        disabled={hasIncompleteSets}
        onClick={onFinish}
        className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Finish Workout
      </button>
    </div>
  );
}
