"use client";
import {useState} from "react";
import {useParams} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";
import {useWorkout} from "@/hooks/useWorkout";
import {useExercises} from "@/hooks/useExercises";
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
  const [elapsedDuration, setElapsedDuration] = useState(0);

  const {isLoading: authLoading, isAuthenticated} = useAuth();
  const {workout, setWorkout, loading, error, refetch} = useWorkout(workoutId);
  const defaultExercises = useExercises();

  const handleSetComplete = () => {
    setTimerResetSignal((prev) => prev + 1);
  };

  const handleDeleteExercise = async (exerciseId: string) => {
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
  };

  const handleFinishWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}/finish`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({duration: elapsedDuration}),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to finish workout");
      }

      refetch();
    } catch (e: any) {
      console.error(e);
      alert("Failed to finish workout");
    }
  };

  const hasIncompleteSets = workout?.exercises?.some((exercise: Exercise) =>
    exercise.sets?.some((set) => !set.completed)
  );

  if (authLoading || loading) return <LoadingSpinner />;
  if (!isAuthenticated) return null; // Already redirecting
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!workout?.finished && (
        <div className="mb-8">
          <Timer
            resetSignal={timerResetSignal}
            onDurationUpdate={setElapsedDuration}
          />
        </div>
      )}

      <ExerciseList
        exercises={workout?.exercises || []}
        workoutId={workoutId}
        finished={workout?.finished || false}
        onDeleteExercise={handleDeleteExercise}
        onSetAdded={refetch}
        onSetComplete={handleSetComplete}
      />

      {!workout?.finished && (
        <>
          <AddExerciseSection
            workoutId={workoutId}
            defaultExercises={defaultExercises}
            onWorkoutUpdate={setWorkout}
          />

          <WorkoutActions
            workoutId={workoutId}
            hasIncompleteSets={!!hasIncompleteSets}
            elapsedDuration={elapsedDuration}
            onFinish={handleFinishWorkout}
          />
        </>
      )}
    </div>
  );
}
