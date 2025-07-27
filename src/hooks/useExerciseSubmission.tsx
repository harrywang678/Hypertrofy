import {Exercise} from "@/types/workout";

export const useExerciseSubmission = (workoutId?: string) => {
  const submitToWorkout = async (exercises: Exercise[]) => {
    const res = await fetch(`/api/workouts/${workoutId}/addExercises`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        exercises: exercises.map((ex) => ({
          exerciseId: ex._id,
          name: ex.name,
          muscle: ex.muscle,
          equipment: ex.equipment,
        })),
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add exercises.");

    // Refresh workout
    const refreshedWorkoutRes = await fetch(`/api/workouts/${workoutId}`);
    if (refreshedWorkoutRes.ok) {
      return await refreshedWorkoutRes.json();
    }
    throw new Error("Failed to refresh workout");
  };

  const submitToRoutine = (
    exercises: Exercise[],
    exerciseSets: {[key: string]: number}
  ) => {
    return exercises.map((exercise) => ({
      ...exercise,
      sets: Array(exerciseSets[exercise._id] || 3)
        .fill(null)
        .map(() => ({
          _id: "",
          reps: 0,
          weight: 0,
          completed: false,
        })),
    }));
  };

  return {submitToWorkout, submitToRoutine};
};
