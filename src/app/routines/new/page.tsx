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

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [tempExercisesOrder, setTempExercisesOrder] = useState<Exercise[]>([]);
  const [isEditingOrder, setIsEditingOrder] = useState(false);

  console.log("Selected Exercises", selectedExercises);

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

  // FIXED: Start editing with current exercise order
  const handleEditOrderClick = () => {
    setTempExercisesOrder([...selectedExercises]);
    setIsEditingOrder(true);
  };

  const memoizedExercises = useMemo(
    () => selectedExercises || [],
    [selectedExercises]
  );

  // FIXED: Cancel editing
  const handleCancelEditOrder = () => {
    setTempExercisesOrder([]);
    setIsEditingOrder(false);
    setDragIndex(null);
  };

  // FIXED: Save the new order
  const handleSaveOrder = () => {
    setSelectedExercises([...tempExercisesOrder]);
    setTempExercisesOrder([]);
    setIsEditingOrder(false);
    setDragIndex(null);
  };

  const handleDragStart = (event: React.DragEvent, originalIndex: number) => {
    setDragIndex(originalIndex);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: React.DragEvent, newIndex: number) => {
    event.preventDefault();

    if (dragIndex === null || dragIndex === newIndex) return;

    const newOrder = [...tempExercisesOrder];
    const draggedItem = newOrder[dragIndex];

    // Remove dragged item
    newOrder.splice(dragIndex, 1);
    // Insert at new position
    newOrder.splice(newIndex, 0, draggedItem);

    setTempExercisesOrder(newOrder);
    setDragIndex(newIndex);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const removeExercise = (indexToRemove: number) => {
    if (isEditingOrder) {
      // Remove from temp order during editing
      setTempExercisesOrder((prev) =>
        prev.filter((_, i) => i !== indexToRemove)
      );
    } else {
      // Remove from main list
      setSelectedExercises((prev) =>
        prev.filter((_, i) => i !== indexToRemove)
      );
    }
  };

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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Selected Exercises ({selectedExercises.length}):
              </h3>

              {/* FIXED: Single Edit Order controls */}
              {selectedExercises.length > 1 && !isEditingOrder && (
                <button
                  type="button"
                  onClick={handleEditOrderClick}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Edit Order
                </button>
              )}

              {isEditingOrder && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveOrder}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Save Order
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditOrder}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* FIXED: Conditional rendering based on editing mode */}
            {isEditingOrder ? (
              // Editing mode - drag and drop interface
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Drag exercises to reorder them:
                </p>
                {tempExercisesOrder.map((exercise, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`p-4 border rounded-lg cursor-move transition-all ${
                      dragIndex === index
                        ? "opacity-50 scale-105 border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center text-gray-400">
                          <div className="text-xs">#{index + 1}</div>
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {exercise.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Muscle: {exercise.muscle} | Equipment:{" "}
                            {exercise.equipment}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {exercise.sets?.length || 0} sets
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Normal mode - regular exercise list
              <div className="space-y-3">
                {selectedExercises.map((exercise, index) => (
                  <div
                    key={index}
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
                        onClick={() => removeExercise(index)}
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
            )}
          </div>
        )}

        {/* FIXED: Hide AddExerciseForm during editing */}
        {!isEditingOrder && (
          <AddExerciseForm
            exercises={defaultExercises}
            addFormRoutine={true}
            onAddExercise={addExercisesToRoutine}
          />
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={
              !routineName.trim() ||
              selectedExercises.length === 0 ||
              isEditingOrder
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Routine
          </button>
        </div>
      </form>
    </div>
  );
}
