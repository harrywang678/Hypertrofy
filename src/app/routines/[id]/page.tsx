"use client";

import {useEffect, useState, useCallback} from "react";
import {useParams, useRouter} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import AddExerciseForm from "@/components/AddExerciseForm";
import {useDefaultExercises} from "@/hooks/useDefaultExercises";
import {Exercise} from "@/types/workout";
import {ObjectId} from "bson";

function UpdateRoutine() {
  const {id} = useParams();
  const router = useRouter();
  const {loading: authLoading, isAuthenticated, user} = useAuth();
  const [routineName, setRoutineName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const defaultExercises = useDefaultExercises();

  console.log(selectedExercises);

  useEffect(() => {
    if (!id) return;
    const fetchRoutine = async () => {
      try {
        const res = await fetch(`/api/routines/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch routine.");
          return;
        }

        setRoutineName(data.name);
        setSelectedExercises(data.exercises); // assumes exercises come in your Exercise shape
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred.");
      }
    };

    fetchRoutine();
  }, [id]);

  const updateExerciseSets = useCallback(
    (exerciseId: string, newSetCount: number) => {
      setSelectedExercises((prev) =>
        prev.map((exercise) => {
          if (exercise.exerciseId === exerciseId) {
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

  const addExercisesToRoutine = useCallback((newExercises: any) => {
    const transformed = newExercises.map((exercise: any) => ({
      ...exercise,
      exerciseId: exercise._id,
      _id: new ObjectId().toString(), // unique per instance
      sets: exercise.sets || [
        {reps: 0, weight: 0, completed: false},
        {reps: 0, weight: 0, completed: false},
        {reps: 0, weight: 0, completed: false},
      ],
    }));

    setSelectedExercises((prev) => [...prev, ...transformed]);
  }, []);

  const handleUpdateRoutine = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!routineName.trim()) {
      setError("Please enter a routine name.");
      return;
    }

    if (selectedExercises.length === 0) {
      setError("Please add at least one exercise.");
      return;
    }

    const exercisesPayload = selectedExercises.map((exercise) => ({
      muscle: exercise.muscle,
      equipment: exercise.equipment,
      exerciseId: exercise.exerciseId || exercise._id,
      name: exercise.name,
      sets:
        exercise.sets?.map((set) => ({
          reps: set.reps,
          weight: set.weight,
          completed: set.completed,
        })) || [],
    }));

    console.log("Payload", exercisesPayload);

    try {
      const res = await fetch(`/api/routines/${id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          name: routineName,
          exercises: exercisesPayload,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.log("Data", data);
        setError(data.error || "Failed to update routine.");
        return;
      }

      router.push("/routines");
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    }
  };

  if (authLoading || !isAuthenticated) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Update Routine</h1>

      <form onSubmit={handleUpdateRoutine} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Routine Name:
          </label>
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Enter routine name..."
            required
          />
        </div>

        {selectedExercises.length > 0 && (
          <div className="bg-black-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">
              Selected Exercises ({selectedExercises.length}):
            </h3>
            <div className="space-y-3">
              {selectedExercises.map((exercise, index) => (
                <div
                  key={exercise.exerciseId}
                  className="bg-black border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-sm text-gray-600">
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
                    <label className="text-sm font-medium">
                      Number of sets:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={exercise.sets?.length || 3}
                      onChange={(e) =>
                        updateExerciseSets(
                          exercise.exerciseId,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-20 px-2 py-1 text-sm border rounded"
                    />
                    <span className="text-sm text-gray-500">sets</span>
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
            Update Routine
          </button>
        </div>
      </form>
    </div>
  );
}

export default UpdateRoutine;
