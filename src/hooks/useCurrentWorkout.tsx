import {useState, useEffect, useCallback} from "react";
import {useRouter} from "next/navigation";

export const useCurrentWorkout = (session: any) => {
  const [latestWorkout, setLatestWorkout] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchLatestWorkout = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/workouts/latest-unfinished");

      if (res.ok) {
        const data = await res.json();
        setLatestWorkout(data);
      } else if (res.status === 404) {
        // No unfinished workout found
        setLatestWorkout(null);
      } else {
        const errorData = await res.json();
        console.error("API error:", errorData);
        setLatestWorkout(null);
      }
    } catch (err) {
      console.error("Error fetching workout:", err);
      setLatestWorkout(null);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchLatestWorkout();
  }, [fetchLatestWorkout]);

  // Auto-refresh when user navigates back to the page
  useEffect(() => {
    const handleFocus = () => {
      fetchLatestWorkout();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchLatestWorkout();
      }
    };

    // Refresh when window gains focus (user switches back to tab)
    window.addEventListener("focus", handleFocus);
    // Refresh when tab becomes visible (user switches back to tab)
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchLatestWorkout]);

  const handleResumeWorkout = () => {
    if (latestWorkout?._id) {
      router.push(`/workouts/${latestWorkout._id}`);
    }
  };

  const handleDiscardWorkout = async () => {
    if (!latestWorkout?._id) return;

    try {
      const res = await fetch(`/api/workouts/${latestWorkout._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setLatestWorkout(null);
        alert("Workout discarded successfully");
      } else {
        const errorData = await res.json();
        alert(`Error discarding workout: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Error discarding workout:", err);
      alert("Failed to discard workout");
    }
  };

  return {
    latestWorkout,
    isLoading,
    handleResumeWorkout,
    handleDiscardWorkout,
  };
};
