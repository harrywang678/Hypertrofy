"use client";
import {Exercise} from "@/types/workout";
import ExerciseCard from "@/components/ExerciseCard";

interface ExerciseListProps {
  exercises: Exercise[];
  workoutId: string;
  finished: boolean;
  onDeleteExercise: (exerciseId: string) => void;
  onSetAdded: () => void;
  onSetComplete: () => void;
}

export default function ExerciseList({
  exercises,
  workoutId,
  finished,
  onDeleteExercise,
  onSetAdded,
  onSetComplete,
}: ExerciseListProps) {
  if (!exercises?.length) return null;

  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Exercises in This Workout
      </h2>
      <ul className="space-y-6">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise._id}
            exercise={exercise}
            workoutId={workoutId}
            onDelete={onDeleteExercise}
            onSetAdded={onSetAdded}
            finished={finished}
            onSetComplete={onSetComplete}
          />
        ))}
      </ul>
    </section>
  );
}
