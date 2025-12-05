interface GroupNumberInputProps {
  value: number;
  onChange: (value: number) => void;
}

export function GroupNumberInput({ value, onChange }: GroupNumberInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="groupCount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Nombre de groupes
      </label>
      <input
        type="number"
        id="groupCount"
        min={1}
        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50 dark:focus:ring-blue-400"
        value={value === 0 ? "" : value}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          onChange(isNaN(val) ? 0 : val);
        }}
      />
    </div>
  );
}
