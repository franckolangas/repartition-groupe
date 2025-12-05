

// Implementing directly for now to keep it simple and dependency-free for UI libs unless requested.
// Actually, I'll stick to standard Tailwind classes for simplicity as requested.

interface ParticipantsInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ParticipantsInput({ value, onChange }: ParticipantsInputProps) {
  const count = value.split("\n").filter((line) => line.trim().length > 0).length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor="participants" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Participants (un par ligne)
        </label>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {count} participant{count > 1 ? "s" : ""}
        </span>
      </div>
      <textarea
        id="participants"
        className="min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50 dark:focus:ring-blue-400"
        placeholder="Jean&#10;Marie&#10;Pierre&#10;Paul"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
