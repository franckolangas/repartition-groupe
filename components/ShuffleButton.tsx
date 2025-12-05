import { Loader2 } from "lucide-react";

interface ShuffleButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function ShuffleButton({ onClick, isLoading }: ShuffleButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400"
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Répartir
    </button>
  );
}
