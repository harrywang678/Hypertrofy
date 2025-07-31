"use client";

import {useState, useEffect} from "react";
import {useAuth} from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import {Routine} from "@/types/workout";
import RoutinesCard from "@/components/routines/RoutinesCard";

export default function UserRoutines() {
  const {loading: authLoading, isAuthenticated, user} = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    const fetchUserRoutines = async () => {
      try {
        const res = await fetch(`api/routines/users/${user?.id}`, {
          method: "GET",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch routines.");
        }
        const data = await res.json();
        setRoutines(data);
      } catch (e: Error | any) {
        setError(e.message || "Failed to fetch your routines.");
      }
    };

    fetchUserRoutines();
  }, [user?.id]);

  if (authLoading || !isAuthenticated) return <LoadingSpinner />;

  if (error) return <ErrorMessage message={error} />;

  return (
    <main>
      <h1> Your Routines </h1>
      <RoutinesCard
        setRoutines={setRoutines}
        routines={routines}
        userId={user?.id ?? ""}
      />
    </main>
  );
}
