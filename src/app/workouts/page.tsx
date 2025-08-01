"use client";

import {useEffect, useState} from "react";
import Link from "next/link";

export interface Workout {
  _id: string;
  userId: string;
  name: string;
  date: Date;
  notes?: string;
  exercises: string[];
  createdAt: Date;
}

export default function UserWorkouts() {
  const [userWorkouts, setUserWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const fetchAllWorkouts = async () => {
      try {
        const res = await fetch("/api/workouts/user", {
          method: "GET",
          headers: {"Content-Type": "application/json"},
        });
        if (!res.ok) throw new Error("Failed to fetch workouts");
        const data = await res.json();
        setUserWorkouts(data);
      } catch (err) {
        console.error("Error fetching user workouts:", err);
      }
    };

    fetchAllWorkouts();
  }, []);

  const handleDeleteWorkout = async (id: string) => {
    try {
      const res = await fetch(`/api/workouts/${id}`, {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete workout");
      }

      setUserWorkouts((prev) => prev.filter((workout) => workout._id !== id));
    } catch (error: any) {
      console.error("Error deleting workout:", error);
      alert("Failed to delete workout: " + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        My Workouts
      </h2>

      {userWorkouts.length === 0 ? (
        <div className="text-gray-600 dark:text-gray-300">
          No workouts found.
        </div>
      ) : (
        <ul className="space-y-6">
          {userWorkouts.map((workout) => (
            <li key={workout._id}>
              <div className="cursor-pointer border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-transform duration-200">
                <Link href={`/workouts/${workout._id}`}>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {workout.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(workout.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Notes:</span>{" "}
                    {workout.notes || "No notes"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Exercises:</span>{" "}
                    {workout.exercises.length || "No exercises logged"}
                  </p>
                </Link>
              </div>
              <button onClick={() => handleDeleteWorkout(workout._id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
