import {useState, useCallback} from "react";
import {Exercise} from "@/types/workout";

export const useExerciseSelection = () => {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [exerciseSets, setExerciseSets] = useState<{[key: string]: number}>({});

  const toggleExercise = useCallback((exercise: Exercise, checked: boolean) => {
    if (checked) {
      setSelectedExercises((prev) => [...prev, exercise]);
      setExerciseSets((prev) => ({...prev, [exercise._id]: 3}));
    } else {
      setSelectedExercises((prev) =>
        prev.filter((ex) => ex._id !== exercise._id)
      );
      setExerciseSets((prev) => {
        const newSets = {...prev};
        delete newSets[exercise._id];
        return newSets;
      });
    }
  }, []);

  const removeExercise = useCallback((exerciseId: string) => {
    setSelectedExercises((prev) => prev.filter((ex) => ex._id !== exerciseId));
    setExerciseSets((prev) => {
      const newSets = {...prev};
      delete newSets[exerciseId];
      return newSets;
    });
  }, []);

  const updateSetCount = useCallback((exerciseId: string, count: number) => {
    setExerciseSets((prev) => ({
      ...prev,
      [exerciseId]: Math.max(1, count),
    }));
  }, []);

  const reset = useCallback(() => {
    setSelectedExercises([]);
    setExerciseSets({});
  }, []);

  return {
    selectedExercises,
    exerciseSets,
    toggleExercise,
    removeExercise,
    updateSetCount,
    reset,
  };
};
