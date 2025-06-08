"use client";

import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

export default function DashboardPage() {
  const {data: session, status} = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [workoutId, setWorkoutId] = useState("");
  const [workoutResult, setWorkoutResult] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!session && status !== "loading") {
      router.replace("/api/auth/signin");
    }
  }, [session, status]);

  const createWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          userId: session?.user?.id, // make sure user.id is in your session
          name,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Workout created: ${data.workout._id}`);
      } else {
        setMessage(data.error || "Failed to create workout");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong.");
    }
  };

  const fetchWorkout = async () => {
    try {
      const res = await fetch(`/api/workouts?id=${workoutId}`);
      const data = await res.json();
      if (res.ok) {
        setWorkoutResult(data);
        setMessage("");
      } else {
        setWorkoutResult(null);
        setMessage(data.error || "Failed to fetch workout");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error fetching workout");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      {/* Create Workout Form */}
      <form onSubmit={createWorkout} className="space-y-2 mb-6">
        <h2 className="text-lg font-medium">Create a New Workout</h2>
        <input
          type="text"
          placeholder="Workout Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Workout
        </button>
      </form>

      {/* Get Workout By ID */}
      <div className="space-y-2 mb-4">
        <h2 className="text-lg font-medium">Get Workout by ID</h2>
        <input
          type="text"
          placeholder="Workout ID"
          value={workoutId}
          onChange={(e) => setWorkoutId(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          onClick={fetchWorkout}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Fetch Workout
        </button>
      </div>

      {/* Workout Result */}
      {workoutResult && (
        <div className="bg-gray-100 p-4 rounded mt-4 text-sm overflow-x-auto">
          <pre>{JSON.stringify(workoutResult, null, 2)}</pre>
        </div>
      )}

      {/* Message */}
      {message && <p className="mt-4 text-red-600 font-medium">{message}</p>}
    </div>
  );
}
