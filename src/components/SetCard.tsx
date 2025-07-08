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
    <li>
      <div className="flex items-center gap-4">
        {!finished && (
          <input
            type="checkbox"
            checked={set.completed ?? false}
            onChange={() => onToggleComplete(!set.completed)}
          />
        )}
        <span>
          Reps: {set.reps}, Weight: {set.weight} lbs
        </span>
        {!finished && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
