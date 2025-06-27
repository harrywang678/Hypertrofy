interface Set {
  reps: number;
  weight: number;
}

interface Exercise {
  _id: string;
  name: string;
  muscle: string;
  equipment: string;
  sets?: Set[];
}

interface ExerciseCardProps {
  exercise: Exercise;
  workoutId: string;
  onDelete: (exerciseId: string) => void;
}

export default function ExerciseCard({
  exercise,
  workoutId,
  onDelete,
}: ExerciseCardProps) {
  const handleDelete = () => {
    if (confirm(`Remove "${exercise.name}" from workout?`)) {
      console.log("this is exercise:", exercise);
      onDelete(exercise._id);
    }
  };

  return (
    <li className="mb-4 flex justify-between items-start">
      <div>
        <strong>{exercise.name}</strong> — {exercise.muscle} |{" "}
        {exercise.equipment}
        {exercise.sets && exercise.sets.length > 0 && (
          <ul className="mt-1 ml-4 list-disc text-sm">
            {exercise.sets.map((s, i) => (
              <li key={i}>
                Reps: {s.reps}, Weight: {s.weight} lbs
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        onClick={handleDelete}
        className="text-red-600 hover:text-red-800 text-sm"
      >
        Delete
      </button>
    </li>
  );
}
