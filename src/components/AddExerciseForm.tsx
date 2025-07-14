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
  setshowAddExerciseForm?: (show: boolean) => void;
  defaultExercises?: Exercise[];
}

export default function AddExerciseForm({
  workoutId,
  session,
  onWorkoutUpdate,
  setshowAddExerciseForm,
  defaultExercises,
}: AddExerciseFormProps) {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

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

      setSelectedExercises([]);

      const refreshedWorkoutRes = await fetch(`/api/workouts/${workoutId}`);
      if (refreshedWorkoutRes.ok) {
        const refreshedWorkout = await refreshedWorkoutRes.json();
        onWorkoutUpdate(refreshedWorkout);
        if (setshowAddExerciseForm) setshowAddExerciseForm(false);
      } else {
        console.error("Failed to refresh workout after adding exercises");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm max-w-xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmitExisting();
        }}
        className="space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Select Exercises
          </label>
          <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-3 space-y-2">
            {defaultExercises?.map((exercise) => (
              <label
                key={exercise._id}
                className="flex items-center gap-3 text-gray-800 dark:text-gray-100"
              >
                <input
                  type="checkbox"
                  className="accent-blue-600"
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
                <span>{exercise.name}</span>
              </label>
            ))}
          </div>
        </div>

        {selectedExercises.length > 0 && (
          <div className="text-sm text-gray-700 dark:text-gray-200">
            <p className="font-medium mb-1">Selected Exercises:</p>
            <ul className="list-disc ml-5 space-y-1">
              {selectedExercises.map((ex) => (
                <li key={ex._id}>{ex.name}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition"
          >
            Add Exercises
          </button>
        </div>
      </form>
    </div>
  );
}
