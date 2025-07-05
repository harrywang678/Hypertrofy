"use client";

import {useState} from "react";

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

interface ExerciseCardProps {
  exercise: Exercise;
  workoutId: string;
  onDelete: (exerciseId: string) => void;
  onSetAdded?: () => void; // Optional callback to refresh after adding a set
  finished?: boolean;
}

export default function ExerciseCard({
  exercise,
  workoutId,
  onDelete,
  onSetAdded,
  finished,
}: ExerciseCardProps) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    if (confirm(`Remove "${exercise.name}" from workout?`)) {
      onDelete(exercise._id);
    }
  };

  const handleAddSet = async () => {
    if (!reps || !weight) {
      alert("Please enter both reps and weight.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/workouts/${workoutId}/exercises/${exercise._id}/sets`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({reps: Number(reps), weight: Number(weight)}),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add set");

      setReps("");
      setWeight("");
      if (onSetAdded) await onSetAdded(); // refresh if provided
    } catch (err: any) {
      alert("Error adding set: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = async (setId: string) => {
    try {
      const res = await fetch(
        `/api/workouts/${workoutId}/exercises/${exercise._id}/sets/${setId}`,
        {method: "DELETE"}
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete set");
      }

      if (onSetAdded) await onSetAdded();
    } catch (e: any) {
      alert("Error deleting set: " + e.message);
      console.error(e);
    }
  };

  return (
    <li className="mb-6 p-4 bg-gray-900 rounded shadow-md text-white">
      <div className="flex justify-between items-start mb-2">
        <div>
          <strong>{exercise.name}</strong> — {exercise.muscle} |{" "}
          {exercise.equipment}
          {exercise.sets && exercise.sets.length > 0 && (
            <ul className="mt-2 ml-4 list-disc text-sm">
              {exercise.sets.map((s, i) => (
                <li key={s._id}>
                  Reps: {s.reps}, Weight: {s.weight} lbs{" "}
                  {!finished && (
                    <button
                      onClick={() => handleDeleteSet(s._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        {!finished && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        )}
      </div>

      {/* Add Set Form */}
      {!finished && (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-20 px-2 py-1 border rounded text-white"
          />
          <input
            type="number"
            placeholder="Weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-20 px-2 py-1 border rounded text-white"
          />
          <button
            onClick={handleAddSet}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            {loading ? "Adding..." : "Add Set"}
          </button>
        </div>
      )}
    </li>
  );
}
