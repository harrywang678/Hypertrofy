"use client";

import {useState, useEffect} from "react";

interface Exercise {
  _id: string;
  name: string;
  muscle: string;
  equipment: string;
}

interface AddExerciseFormProps {
  workoutId: string;
  session: any;
  onWorkoutUpdate: (updatedWorkout: any) => void;
}

interface Set {
  reps: number;
  weight: number;
}

export default function AddExerciseForm({
  workoutId,
  session,
  onWorkoutUpdate,
}: AddExerciseFormProps) {
  const [defaultExercises, setDefaultExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch("/api/exercises?default=true");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setDefaultExercises(data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };
    fetchExercises();
  }, []);

  const handleSubmitExisting = async () => {
    if (selectedExercises.length === 0) {
      alert("Please select at least one exercise.");
      return;
    }

    try {
      const res = await fetch(`/api/workouts/${workoutId}/addExercises`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exercises: selectedExercises.map((ex) => ({
            exerciseId: ex._id,
            name: ex.name,
            muscle: ex.muscle,
            equipment: ex.equipment,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add exercises.");

      alert("Exercises added!");
      setSelectedExercises([]);

      const refreshedWorkoutRes = await fetch(`/api/workouts/${workoutId}`);
      if (refreshedWorkoutRes.ok) {
        const refreshedWorkout = await refreshedWorkoutRes.json();
        onWorkoutUpdate(refreshedWorkout);
      } else {
        console.error("Failed to refresh workout after adding exercises");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="mt-6 bg-black p-4 rounded shadow-md max-w-md mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitExisting();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block font-medium mb-1 text-white">
            Select Exercises
          </label>
          <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-800 p-2 rounded">
            {defaultExercises.map((exercise) => (
              <label
                key={exercise._id}
                className="flex items-center gap-2 text-white"
              >
                <input
                  type="checkbox"
                  checked={selectedExercises.some(
                    (e) => e._id === exercise._id
                  )}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedExercises([...selectedExercises, exercise]);
                    } else {
                      setSelectedExercises(
                        selectedExercises.filter(
                          (ex) => ex._id !== exercise._id
                        )
                      );
                    }
                  }}
                />
                {exercise.name}
              </label>
            ))}
          </div>
        </div>

        {selectedExercises.length > 0 && (
          <div className="text-white text-left">
            <p className="font-semibold mt-2">Selected:</p>
            <ul className="list-disc ml-5">
              {selectedExercises.map((ex) => (
                <li key={ex._id}>{ex.name}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
          >
            Add Exercises
          </button>
        </div>
      </form>
    </div>
  );
}
