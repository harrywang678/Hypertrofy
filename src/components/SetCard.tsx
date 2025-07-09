interface SetCardProps {
  set: {
    _id: string;
    reps: number;
    weight: number;
    completed: boolean;
  };
  finished?: boolean;
  onToggleComplete: (completed: boolean) => void;
  onDelete: () => void;
}

export default function SetCard({
  set,
  finished,
  onToggleComplete,
  onDelete,
}: SetCardProps) {
  return (
    <li className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-between text-sm">
      <div className="flex items-center gap-3">
        {!finished && (
          <input
            type="checkbox"
            checked={set.completed ?? false}
            onChange={() => onToggleComplete(!set.completed)}
            className="accent-gray-700"
          />
        )}
        <span className="text-gray-800 dark:text-gray-200">
          <span className="font-medium">Reps:</span> {set.reps},{" "}
          <span className="font-medium">Weight:</span> {set.weight} lbs
        </span>
      </div>

      {!finished && (
        <button
          onClick={onDelete}
          className="ml-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition text-xs"
        >
          Delete
        </button>
      )}
    </li>
  );
}
