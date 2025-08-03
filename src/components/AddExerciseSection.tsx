"use client";
import {useState} from "react";
import {Exercise} from "@/types/workout";
import AddExerciseForm from "@/components/AddExerciseForm";

interface AddExerciseSectionProps {
  workoutId?: string;
  exercises: Exercise[];
  setWorkout?: (workout: any) => void;
}

export default function AddExerciseSection({
  workoutId,
  exercises,
  setWorkout,
}: AddExerciseSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  return (
    <>
      <button
        className="mb-6 w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium py-2 px-4 rounded transition"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Hide Form" : "Add New Exercise"}
      </button>

      {showForm && (
        <AddExerciseForm
          workoutId={workoutId}
          setWorkout={setWorkout}
          setshowAddExerciseForm={setShowForm}
          exercises={exercises}
          addFormWorkout={true}
          setSelectedExercises={setSelectedExercises}
        />
      )}
    </>
  );
}
