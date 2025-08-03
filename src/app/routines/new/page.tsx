"use client";

import {useEffect, useState, memo, useMemo, useCallback} from "react";
import {useRouter} from "next/navigation";
import AddExerciseForm from "@/components/AddExerciseForm";
import {useAuth} from "@/hooks/useAuth";
import {useDefaultExercises} from "@/hooks/useDefaultExercises";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import {Exercise} from "@/types/workout";

export default function CreateNewRoutinePage() {
  const router = useRouter();
  const {loading: authLoading, isAuthenticated, user} = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [routineName, setRoutineName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const defaultExercises = useDefaultExercises();

  const handleSubmitCreateRoutine = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!routineName.trim()) {
      setError("Please enter a routine name.");
      return;
    }

    if (selectedExercises.length === 0) {
      setError("Please add at least one exercise to the routine.");
      return;
    }

    const exercisesPayload = selectedExercises.map((exercise) => ({
      muscle: exercise.muscle,
      equipment: exercise.equipment,
      exerciseId: exercise._id,
      name: exercise.name,
      sets:
        exercise.sets?.map((set) => ({
          reps: set.reps,
          weight: set.weight,
          completed: set.completed,
        })) || [],
    }));

    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: routineName,
          userId: user?.id,
          exercises: exercisesPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create routine.");
        return;
      }

      router.push("/routines");
    } catch (err) {
      console.error("Error creating routine:", err);
      setError("An unexpected error occurred.");
    }
  };

  // Function to update the number of sets for a specific exercise
  const updateExerciseSets = useCallback(
    (exerciseId: string, newSetCount: number) => {
      setSelectedExercises((prev) =>
        prev.map((exercise) => {
          if (exercise._id === exerciseId) {
            const newSets = Array(Math.max(1, newSetCount))
              .fill(null)
              .map((_, index) => ({
                _id: `temp-${exerciseId}-${index}`,
                reps: exercise.sets?.[index]?.reps || 0,
                weight: exercise.sets?.[index]?.weight || 0,
                completed: false,
              }));

            return {
              ...exercise,
              sets: newSets,
            };
          }
          return exercise;
        })
      );
    },
    []
  );

  const addExercisesToRoutine = useCallback((newExercises: Exercise[]) => {
    setSelectedExercises((prev) => [...prev, ...newExercises]);
  }, []);

  if (authLoading || !isAuthenticated) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Routine</h1>

      <form onSubmit={handleSubmitCreateRoutine} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Routine Name:
          </label>
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Enter routine name..."
            required
          />
        </div>

        {selectedExercises.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Selected Exercises ({selectedExercises.length}):
            </h3>
            <div className="space-y-3">
              {selectedExercises.map((exercise, index) => (
                <div
                  key={exercise._id}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {exercise.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Muscle: {exercise.muscle} | Equipment:{" "}
                        {exercise.equipment}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedExercises((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-4"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Number of sets:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={exercise.sets?.length || 3}
                      onChange={(e) =>
                        updateExerciseSets(
                          exercise._id,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      sets
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <AddExerciseForm
          exercises={defaultExercises}
          addFormRoutine={true}
          onAddExercise={addExercisesToRoutine}
        />

        <div className="pt-4">
          <button
            type="submit"
            disabled={!routineName.trim() || selectedExercises.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Routine
          </button>
        </div>
      </form>
    </div>
  );
}
