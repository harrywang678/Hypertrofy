"use client";

import {useEffect, useRef, useState} from "react";

interface TimerProps {
  initialTime?: number;
  resetSignal: number;
}

export default function Timer({initialTime = 180, resetSignal}: TimerProps) {
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

  useEffect(() => {
    if (resetSignal > 0) {
      resetCountdown();
      startCountdown();
    }
  }, [resetSignal]);

  return (
    <div className="w-full max-w-md mx-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Timer
      </h2>

      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={() => adjustTime(-15)}
          disabled={isRunning}
          className="text-sm px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
        >
          -15s
        </button>

        <p className="text-5xl font-mono text-gray-900 dark:text-white">
          {formatTime(timeLeft)}
        </p>

        <button
          onClick={() => adjustTime(15)}
          disabled={isRunning}
          className="text-sm px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
        >
          +15s
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={startCountdown}
          disabled={isRunning || timeLeft <= 0}
          className="px-5 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
        >
          Start
        </button>

        <button
          onClick={stopCountdown}
          disabled={!isRunning}
          className="px-5 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
        >
          Stop
        </button>

        <button
          onClick={resetCountdown}
          className="px-5 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
