interface AddSetFormProps {
  reps: string;
  weight: string;
  loading: boolean;
  onRepsChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onSubmit: () => void;
}

export default function AddSetForm({
  reps,
  weight,
  loading,
  onRepsChange,
  onWeightChange,
  onSubmit,
}: AddSetFormProps) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="number"
        placeholder="Reps"
        value={reps}
        onChange={(e) => onRepsChange(e.target.value)}
        className="w-18 px-2 py-1 border rounded text-white"
      />
      <input
        type="number"
        placeholder="Weight"
        value={weight}
        onChange={(e) => onWeightChange(e.target.value)}
        className="w-22 px-2 py-1 border rounded text-white"
      />
      <button
        onClick={onSubmit}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
      >
        {loading ? "Adding..." : "Add Set"}
      </button>
    </div>
  );
}
