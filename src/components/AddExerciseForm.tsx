"use client";
import {memo} from "react";
import {Exercise} from "@/types/workout";
import ExerciseItem from "@/components/exercises/ExerciseItem";
import SelectedExercisesPreview from "@/components/exercises/SelectedExercisesPreview";
import {useExerciseSelection} from "@/hooks/useExerciseSelection";
import {useExerciseSubmission} from "@/hooks/useExerciseSubmission";

interface AddExerciseFormProps {
  workoutId?: string;
  setWorkout?: (updatedWorkout: any) => void;
  setshowAddExerciseForm?: (show: boolean) => void;
  defaultExercises?: Exercise[];
  addFormRoutine?: boolean;
  addFormWorkout?: boolean;
  setSelectedExercises?: React.Dispatch<React.SetStateAction<Exercise[]>>;
  onAddExercise?: (exercise: Exercise[]) => void;
}

const AddExerciseForm = memo(function AddExerciseForm({
  workoutId,
  setWorkout,
  setshowAddExerciseForm,
  defaultExercises = [],
  addFormRoutine = false,
  addFormWorkout = false,
  setSelectedExercises,
  onAddExercise,
}: AddExerciseFormProps) {
  const {
    selectedExercises,
    exerciseDictionaryWithSets,
    toggleExercise,
    removeExercise,
    updateSetCount,
    reset,
  } = useExerciseSelection();

  const {submitToWorkout, submitToRoutine} = useExerciseSubmission(workoutId);

  const handleSubmit = async () => {
    if (selectedExercises.length === 0) {
      alert("Please select at least one exercise.");
      return;
    }

    try {
      if (addFormWorkout) {
        const refreshedWorkout = await submitToWorkout(selectedExercises);
        setWorkout?.(refreshedWorkout);
        setshowAddExerciseForm?.(false);
      } else if (addFormRoutine) {
        const exercisesWithSets = submitToRoutine(
          selectedExercises,
          exerciseDictionaryWithSets
        );
        setSelectedExercises?.((prev) => [
          ...(prev || []),
          ...exercisesWithSets,
        ]);
        onAddExercise?.(exercisesWithSets);
        alert("Exercises added to routine!");
      }
      reset();
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm max-w-xl mx-auto">
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Select Exercises
          </label>
          <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md p-3 space-y-2">
            {defaultExercises.map((exercise) => (
              <ExerciseItem
                key={exercise._id}
                exercise={exercise}
                isSelected={selectedExercises.some(
                  (e) => e._id === exercise._id
                )}
                onToggle={toggleExercise}
                setCount={exerciseDictionaryWithSets[exercise._id]}
                onSetCountChange={updateSetCount}
                showSetInput={addFormRoutine}
              />
            ))}
          </div>
        </div>

        <SelectedExercisesPreview
          exercises={selectedExercises}
          exerciseDictionaryWithSets={exerciseDictionaryWithSets}
          showSets={addFormRoutine}
          onRemove={removeExercise}
        />

        {(addFormWorkout || addFormRoutine) && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={selectedExercises.length === 0}
              className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition"
            >
              {addFormWorkout
                ? "Add Exercises to Workout"
                : "Add Exercises to Routine"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default AddExerciseForm;
