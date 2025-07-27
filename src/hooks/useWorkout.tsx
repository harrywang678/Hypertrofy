import {useState, useEffect} from "react";
import {Workout} from "@/types/workout";

export const useWorkout = (workoutId: string) => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts/${workoutId}`);
      if (!res.ok) throw new Error("Failed to fetch workout");
      const data = await res.json();
      setWorkout(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load workout");
      setLoading(false);
      console.error("Error fetching workout:", err);
    }
  };

  useEffect(() => {
    if (workoutId) fetchWorkout();
  }, [workoutId]);

  return {workout, setWorkout, loading, error, fetchWorkout};
};
