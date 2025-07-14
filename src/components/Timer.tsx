"use client";

import {useEffect, useRef, useState} from "react";

interface TimerProps {
  Time?: number; // initial rest countdown
  resetSignal: number;
  onDurationUpdate?: (duration: number) => void;
}

export default function Timer({
  Time = 180,
  resetSignal,
  onDurationUpdate,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(Time);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [elapsedTime, setElapsedTime] = useState(0);
  const elapsedRef = useRef<NodeJS.Timeout | null>(null);

  const [isEditingTime, setIsEditingTime] = useState(false);
  const [tempTime, setTempTime] = useState<string>("");
  const [customTime, setCustomTime] = useState(Time);

  // 🟢 Start the workout duration timer as soon as the component mounts
  useEffect(() => {
    elapsedRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        const updated = prev + 1;
        onDurationUpdate?.(updated);
        return updated;
      });
    }, 1000);

    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  // 🟢 Format mm:ss
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // 🟡 Countdown timer logic
  const clearCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startCountdown = () => {
    if (intervalRef.current || timeLeft <= 0) return;

    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const updated = prev - 1;
        if (updated <= 0) {
          clearCountdown();
          setIsRunning(false);
          alert("Time's up!");
          return 0;
        }
        return updated;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    clearCountdown();
    setIsRunning(false);
  };

  const resetCountdown = () => {
    setTimeLeft(customTime);
    stopCountdown();
  };

  const adjustTime = (amount: number) => {
    setTimeLeft((prev) => Math.max(0, prev + amount));
    setCustomTime((prev) => Math.max(0, prev + amount));
  };

  // 🔁 Reset signal for countdown
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

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Workout Duration:{" "}
        <span className="font-mono">{formatTime(elapsedTime)}</span>
      </p>

      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={() => adjustTime(-15)}
          disabled={isRunning}
          className="text-sm px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
        >
          -15s
        </button>

        {isEditingTime ? (
          <input
            type="text"
            value={tempTime}
            onChange={(e) => setTempTime(e.target.value)}
            onBlur={() => {
              const [min, sec] = tempTime
                .split(":")
                .map((n) => parseInt(n, 10));
              const totalSeconds =
                (isNaN(min) ? 0 : min) * 60 + (isNaN(sec) ? 0 : sec);
              setCustomTime(totalSeconds);
              setTimeLeft(totalSeconds);
              setIsEditingTime(false);
            }}
            autoFocus
            className="text-5xl font-mono text-center bg-transparent border-none focus:outline-none text-gray-900 dark:text-white w-[7ch]"
            placeholder="mm:ss"
          />
        ) : (
          <p
            onClick={() => {
              setTempTime(formatTime(timeLeft));
              setIsEditingTime(true);
            }}
            className="text-5xl font-mono text-gray-900 dark:text-white cursor-pointer hover:underline"
            title="Click to edit time"
          >
            {formatTime(timeLeft)}
          </p>
        )}

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
