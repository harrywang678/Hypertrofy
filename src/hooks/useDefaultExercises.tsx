import {useState, useEffect} from "react";
import {Exercise} from "@/types/workout";

export const useDefaultExercises = () => {
  const [defaultExercises, setDefaultExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch("/api/exercises?default=true");
        if (!res.ok) throw new Error("Failed to fetch exercises.");
        const data = await res.json();
        setDefaultExercises(data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    fetchExercises();
  }, []);

  return defaultExercises;
};
