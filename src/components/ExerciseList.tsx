"use client";
import React from "react";
import {Exercise} from "@/types/workout";
import ExerciseCard from "@/components/ExerciseCard";

interface ExerciseListProps {
  exercises: Exercise[];
  workoutId: string;
  workoutFinished: boolean;
  onDeleteExercise: (exerciseId: string) => void;
  fetchWorkout: () => void;
  handleTimerSignal: () => void;
}

function ExerciseList({
  exercises,
  workoutId,
  workoutFinished,
  onDeleteExercise,
  fetchWorkout,
  handleTimerSignal,
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
            fetchWorkout={fetchWorkout}
            workoutFinished={workoutFinished}
            handleTimerSignal={handleTimerSignal}
          />
        ))}
      </ul>
    </section>
  );
}

export default React.memo(ExerciseList);
