"use client";

import {useState, useCallback} from "react";
import SetCard from "@/components/SetCard";
import AddSetForm from "@/components/AddSetForm";

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
}

interface ExerciseCardProps {
  exercise: Exercise;
  workoutId: string;
  onDelete: (exerciseId: string) => void;
  onSetAdded?: () => void; // Optional callback to refresh after adding a set
  finished?: boolean;
  onSetComplete?: () => void;
}

export default function ExerciseCard({
  exercise,
  workoutId,
  onDelete,
  onSetAdded,
  finished,
  onSetComplete,
}: ExerciseCardProps) {
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(() => {
    if (confirm(`Remove "${exercise.name}" from workout?`)) {
      onDelete(exercise._id);
    }
  }, [exercise.name, exercise._id, onDelete]);

  const handleAddSet = useCallback(async () => {
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
      if (onSetAdded) await onSetAdded();
    } catch (err: any) {
      alert("Error adding set: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [reps, weight, workoutId, exercise._id, onSetAdded]);

  const handleDeleteSet = useCallback(
    async (setId: string) => {
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
    },
    [workoutId, exercise._id, onSetAdded]
  );

  const handleToggleSetComplete = useCallback(
    async (setId: string, completed: boolean) => {
      try {
        const res = await fetch(
          `/api/workouts/${workoutId}/exercises/${exercise._id}/sets/${setId}`,
          {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({completed}),
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update set");

        if (onSetAdded) await onSetAdded();
        if (onSetComplete && completed === true) await onSetComplete();
      } catch (err: any) {
        alert("Failed to complete set: " + err.message);
        console.error(err);
      }
    },
    [workoutId, exercise._id, onSetAdded, onSetComplete]
  );

  return (
    <li className="mb-6 p-4 bg-gray-900 rounded shadow-md text-white">
      <div className="flex justify-between items-start mb-2">
        <div>
          <strong>{exercise.name}</strong> — {exercise.muscle} |{" "}
          {exercise.equipment}
          {exercise.sets && exercise.sets.length > 0 && (
            <ul className="mt-2 ml-4 list-none text-sm space-y-1">
              {exercise.sets.map((s, i) => (
                <SetCard
                  key={s._id}
                  set={s}
                  finished={finished}
                  onToggleComplete={(completed) =>
                    handleToggleSetComplete(s._id, completed)
                  }
                  onDelete={() => handleDeleteSet(s._id)}
                />
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
        <AddSetForm
          reps={reps}
          weight={weight}
          loading={loading}
          onRepsChange={setReps}
          onWeightChange={setWeight}
          onSubmit={handleAddSet}
        />
      )}
    </li>
  );
}
