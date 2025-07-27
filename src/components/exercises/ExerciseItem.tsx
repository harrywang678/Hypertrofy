"use client";
import {memo} from "react";
import {Exercise} from "@/types/workout";

interface ExerciseItemProps {
  exercise: Exercise;
  isSelected: boolean;
  onToggle: (exercise: Exercise, checked: boolean) => void;
  setCount?: number;
  onSetCountChange?: (exerciseId: string, count: number) => void;
  showSetInput?: boolean;
}

const ExerciseItem = memo(
  ({
    exercise,
    isSelected,
    onToggle,
    setCount = 3,
    onSetCountChange,
    showSetInput = false,
  }: ExerciseItemProps) => (
    <div>
      <label className="flex items-center gap-3 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded cursor-pointer">
        <input
          type="checkbox"
          className="accent-blue-600"
          checked={isSelected}
          onChange={(e) => onToggle(exercise, e.target.checked)}
        />
        <div className="flex-1">
          <span className="font-medium">{exercise.name}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {exercise.muscle} • {exercise.equipment}
          </p>
        </div>
      </label>

      {isSelected && showSetInput && onSetCountChange && (
        <div className="ml-8 mt-2 flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Sets:
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={setCount}
            onChange={(e) =>
              onSetCountChange(exercise._id, parseInt(e.target.value) || 1)
            }
            className="w-16 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
      )}
    </div>
  )
);

ExerciseItem.displayName = "ExerciseItem";
export default ExerciseItem;
