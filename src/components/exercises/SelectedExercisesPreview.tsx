"use client";
import {memo} from "react";
import {Exercise} from "@/types/workout";

interface SelectedExercisesPreviewProps {
  exercises: Exercise[];
  exerciseSets: {[key: string]: number};
  showSets: boolean;
  onRemove: (exerciseId: string) => void;
}

const SelectedExercisesPreview = memo(
  ({
    exercises,
    exerciseSets,
    showSets,
    onRemove,
  }: SelectedExercisesPreviewProps) => {
    if (exercises.length === 0) return null;

    return (
      <div className="text-sm text-gray-700 dark:text-gray-200">
        <p className="font-medium mb-2">
          Selected Exercises ({exercises.length}):
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
          <ul className="space-y-2">
            {exercises.map((ex) => (
              <li key={ex._id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{ex.name}</span>
                  {showSets && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({exerciseSets[ex._id] || 3} sets)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onRemove(ex._id)}
                  className="text-red-500 hover:text-red-700 text-xs ml-2"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);

SelectedExercisesPreview.displayName = "SelectedExercisesPreview";
export default SelectedExercisesPreview;
