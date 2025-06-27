"use client";
import {useEffect, useRef, useState} from "react";

interface TimerProps {
  initialTime?: number;
}

export default function Timer({initialTime = 180}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    setTimeLeft(initialTime);
  };

  const adjustTime = (amount: number) => {
    setTimeLeft((prev) => Math.max(0, prev + amount));
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    return () => stopCountdown();
  }, []);

  return (
    <div className="text-center">
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
    </div>
  );
}
