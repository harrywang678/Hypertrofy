"use client";
import {useSession} from "next-auth/react";
import {useRouter} from "next/navigation";
import {useEffect, useState, useRef} from "react";

export default function IndividualWorkoutPage() {
  const router = useRouter();
  const {data: session, status} = useSession();

  const [timeLeft, setTimeLeft] = useState(180); // default 3 minutes
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    muscle: "",
    equipment: "",
  });

  const muscleGroups: string[] = [
    "Chest",
    "Back",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Forearms",
    "Abs",
    "Obliques",
    "Quads",
    "Hamstrings",
    "Glutes",
    "Calves",
    "Traps",
    "Lats",
    "Neck",
    "Hip Flexors",
    "Adductors",
    "Abductors",
  ];

  const equipmentList: string[] = [
    "Barbell",
    "Dumbbell",
    "Kettlebell",
    "Machine",
    "Cable",
    "Bodyweight",
    "Resistance Band",
    "Smith Machine",
    "EZ Bar",
    "Trap Bar",
    "Medicine Ball",
    "Sandbag",
    "Foam Roller",
    "Stability Ball",
    "Pull-Up Bar",
    "Dip Bar",
    "Bench",
    "Treadmill",
    "Rowing Machine",
    "Bike",
    "Stair Climber",
    "Sled",
    "Jump Rope",
    "Suspension Trainer (e.g., TRX)",
  ];

  const startCountdown = () => {
    if (intervalRef.current || timeLeft <= 0) return;

    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          alert("Time's up!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  };

  const resetCountdown = () => {
    stopCountdown();
    setTimeLeft(180); // Reset to 3 minutes
  };

  const adjustTime = (amount: number) => {
    setTimeLeft((prev) => Math.max(0, prev + amount));
  };

  useEffect(() => {
    return () => stopCountdown();
  }, []);

  useEffect(() => {
    if (!session && status !== "loading") {
      router.replace("/api/auth/signin");
    }
  }, [session, status]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleAddExercise = () => {
    setShowForm((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/exercises", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...exerciseForm,
          userMade: true,
          userId: session?.user?.id || undefined, // optional userId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      alert("Exercise added successfully!");
      setExerciseForm({name: "", muscle: "", equipment: ""});
      setShowForm(false);
    } catch (error: any) {
      console.error("Failed to add exercise:", error.message);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-2">Countdown Timer</h2>

      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={() => adjustTime(-15)}
          disabled={isRunning}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          -15s
        </button>

        <p className="text-4xl font-mono">{formatTime(timeLeft)}</p>

        <button
          onClick={() => adjustTime(15)}
          disabled={isRunning}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          +15s
        </button>
      </div>

      <div className="flex justify-center gap-3">
        <button
          onClick={startCountdown}
          disabled={isRunning || timeLeft <= 0}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white rounded disabled:opacity-50"
        >
          Start
        </button>
        <button
          onClick={stopCountdown}
          disabled={!isRunning}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 text-white rounded disabled:opacity-50"
        >
          Stop
        </button>
        <button
          onClick={resetCountdown}
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 text-white rounded"
        >
          Reset
        </button>
      </div>

      <button
        onClick={handleAddExercise}
        className="mt-10 bg-purple-600 hover:bg-purple-700 px-6 py-3 text-white font-semibold rounded"
      >
        Add Exercise
      </button>

      {showForm && (
        <form
          className="mt-6 bg-white p-4 rounded shadow-md max-w-md mx-auto space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block font-medium mb-1">Exercise Name</label>
            <input
              type="text"
              value={exerciseForm.name}
              onChange={(e) =>
                setExerciseForm({...exerciseForm, name: e.target.value})
              }
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Muscle Group</label>
            <select
              value={exerciseForm.muscle}
              onChange={(e) =>
                setExerciseForm({...exerciseForm, muscle: e.target.value})
              }
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="" disabled>
                Select muscle group
              </option>
              {muscleGroups.map((muscle) => (
                <option key={muscle} value={muscle}>
                  {muscle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Equipment</label>
            <select
              value={exerciseForm.equipment}
              onChange={(e) =>
                setExerciseForm({...exerciseForm, equipment: e.target.value})
              }
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="" disabled>
                Select equipment
              </option>
              {equipmentList.map((equipment) => (
                <option key={equipment} value={equipment}>
                  {equipment}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit Exercise
          </button>
        </form>
      )}
    </div>
  );
}
