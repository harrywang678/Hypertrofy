"use client";
import {useState, useMemo, useCallback, useRef} from "react";
import {useParams} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";
import {useWorkout} from "@/hooks/useWorkout";
import {useDefaultExercises} from "@/hooks/useDefaultExercises";
import {Exercise} from "@/types/workout";
import Timer from "@/components/Timer";
import ExerciseList from "@/components/ExerciseList";
import AddExerciseSection from "@/components/AddExerciseSection";
import WorkoutActions from "@/components/WorkoutActions";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";

export default function WorkoutPage() {
  const params = useParams();
  const workoutId = params?.id as string;

  const [timerResetSignal, setTimerResetSignal] = useState(0);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [tempExerciseOrder, setTempExerciseOrder] = useState<Exercise[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const elapsedRef = useRef(0);

  const {loading: authLoading, isAuthenticated} = useAuth();
  const {workout, setWorkout, loading, error, fetchWorkout} =
    useWorkout(workoutId);
  const defaultExercises = useDefaultExercises();

  const handleTimerSignal = () => {
    setTimerResetSignal((prev) => prev + 1);
  };

  const handleDeleteExercise = useCallback(
    async (exerciseId: string) => {
      try {
        const res = await fetch(
          `/api/workouts/${workoutId}/exercises/${exerciseId}`,
          {method: "DELETE"}
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete exercise");
        }

        setWorkout((prev: any) => ({
          ...prev,
          exercises: prev.exercises.filter(
            (exercise: Exercise) => exercise._id !== exerciseId
          ),
        }));
      } catch (error: any) {
        alert("Error deleting exercise: " + error.message);
        console.error(error);
      }
    },
    [workoutId, setWorkout]
  );

  // Start editing order mode
  const handleStartEditOrder = () => {
    setTempExerciseOrder([...memoizedExercises]);
    setIsEditingOrder(true);
  };

  // Cancel editing order
  const handleCancelEditOrder = () => {
    setIsEditingOrder(false);
    setTempExerciseOrder([]);
    setDraggedIndex(null);
  };

  // Save new order
  const handleSaveOrder = async () => {
    try {
      // Create array of exercise IDs in new order

      let isEqual = false;

      const originalOrder = memoizedExercises.map((exercise, index) => ({
        exerciseId: exercise._id,
        order: index,
      }));
      const exerciseOrder = tempExerciseOrder.map((exercise, index) => ({
        exerciseId: exercise._id,
        order: index,
      }));

      for (let i = 0; i < exerciseOrder.length; i++) {
        if (
          originalOrder[i].exerciseId === exerciseOrder[i].exerciseId &&
          originalOrder[i].order === exerciseOrder[i].order
        ) {
          isEqual = true;
        } else {
          isEqual = false;
          break;
        }
      }

      if (isEqual) {
        setIsEditingOrder(false);
        setTempExerciseOrder([]);
        setDraggedIndex(null);
      } else {
        const res = await fetch(
          `/api/workouts/${workoutId}/reorder-exercises`,
          {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({exerciseOrder}),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to reorder exercises");
        }

        // Update local state
        setWorkout((prev: any) => ({
          ...prev,
          exercises: tempExerciseOrder,
        }));

        setIsEditingOrder(false);
        setTempExerciseOrder([]);
        setDraggedIndex(null);
      }
    } catch (error: any) {
      alert("Error reordering exercises: " + error.message);
      console.error(error);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, originalIndex: number) => {
    setDraggedIndex(originalIndex);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, newIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === newIndex) return;

    const newOrder = [...tempExerciseOrder];
    const draggedItem = newOrder[draggedIndex];

    // Remove dragged item
    newOrder.splice(draggedIndex, 1);
    // Insert at new position
    newOrder.splice(newIndex, 0, draggedItem);

    setTempExerciseOrder(newOrder);
    setDraggedIndex(newIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const memoizedExercises = useMemo(() => workout?.exercises || [], [workout]);

  const handleFinishWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}/finish`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({duration: elapsedRef.current}),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to finish workout");
      }

      fetchWorkout();
    } catch (e: any) {
      console.error(e);
      alert("Failed to finish workout");
    }
  };

  const hasIncompleteSets = workout?.exercises?.some((exercise: Exercise) =>
    exercise.sets?.some((set) => !set.completed)
  );

  if (authLoading || loading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!workout?.finished && (
        <div className="mb-8">
          <Timer
            resetSignal={timerResetSignal}
            onDurationUpdate={(val) => (elapsedRef.current = val)}
          />
        </div>
      )}

      {/* Edit Order Controls */}
      {!workout?.finished && memoizedExercises.length > 1 && (
        <div className="mb-4 flex gap-2">
          {!isEditingOrder ? (
            <button
              onClick={handleStartEditOrder}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Edit Order
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveOrder}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Save Order
              </button>
              <button
                onClick={handleCancelEditOrder}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Exercise List - either normal or reorderable */}
      {isEditingOrder ? (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            Drag exercises to reorder:
          </h3>
          <div className="space-y-3">
            {tempExerciseOrder.map((exercise, index) => (
              <div
                key={exercise._id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`p-4 border rounded-lg cursor-move transition-all ${
                  draggedIndex === index
                    ? "opacity-50 scale-105 border-blue-400 bg-blue-50"
                    : "border-gray-200 bg-black hover:border-gray-300 hover:shadow-md"
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
                      <h4 className="font-medium">{exercise.name}</h4>
                      <p className="text-sm text-gray-600">
                        {exercise.sets?.length || 0} sets
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm">Drag to reorder</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <ExerciseList
          exercises={memoizedExercises}
          workoutId={workoutId}
          workoutFinished={workout?.finished || false}
          onDeleteExercise={handleDeleteExercise}
          fetchWorkout={fetchWorkout}
          handleTimerSignal={handleTimerSignal}
        />
      )}

      {!workout?.finished && !isEditingOrder && (
        <>
          <AddExerciseSection
            workoutId={workoutId}
            exercises={defaultExercises}
            setWorkout={setWorkout}
          />

          <WorkoutActions
            workoutId={workoutId}
            hasIncompleteSets={!!hasIncompleteSets}
            onFinish={handleFinishWorkout}
          />
        </>
      )}
    </div>
  );
}
