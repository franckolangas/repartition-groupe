import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function splitIntoGroups<T>(array: T[], count: number): T[][] {
  if (count <= 0) return [];
  const groups: T[][] = Array.from({ length: count }, () => []);
  array.forEach((item, index) => {
    groups[index % count].push(item);
  });
  return groups;
}

export function verifyDistribution(initialParticipants: string[], groups: string[][]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const allGroupParticipants = groups.flat();

  // Check for missing participants
  const missing = initialParticipants.filter(p => !allGroupParticipants.includes(p));
  if (missing.length > 0) {
    errors.push(`Participants manquants: ${missing.join(", ")}`);
  }

  // Check for duplicates in groups
  const uniqueGroupParticipants = new Set(allGroupParticipants);
  if (uniqueGroupParticipants.size !== allGroupParticipants.length) {
    // Find duplicates
    const counts: Record<string, number> = {};
    allGroupParticipants.forEach(p => counts[p] = (counts[p] || 0) + 1);
    const duplicates = Object.keys(counts).filter(p => counts[p] > 1);
    errors.push(`Participants en double: ${duplicates.join(", ")}`);
  }

  return { valid: errors.length === 0, errors };
}

export function balanceGroups<T>(groups: T[][]): T[][] {
  // Deep copy to avoid mutating state directly
  const newGroups = groups.map(g => [...g]);

  while (true) {
    const sizes = newGroups.map(g => g.length);
    const minSize = Math.min(...sizes);
    const maxSize = Math.max(...sizes);

    if (maxSize - minSize <= 1) break;

    const maxIndex = sizes.findIndex(s => s === maxSize);
    const minIndex = sizes.findIndex(s => s === minSize);

    const movedItem = newGroups[maxIndex].pop();
    if (movedItem) {
      newGroups[minIndex].push(movedItem);
    } else {
      break; // Should not happen
    }
  }

  return newGroups;
}

export const GROUP_COLORS = [
  { border: 'border-red-500', bg: 'bg-red-50', darkBg: 'dark:bg-red-900/20', text: 'text-red-700', darkText: 'dark:text-red-300', ring: 'focus:ring-red-500' },
  { border: 'border-orange-500', bg: 'bg-orange-50', darkBg: 'dark:bg-orange-900/20', text: 'text-orange-700', darkText: 'dark:text-orange-300', ring: 'focus:ring-orange-500' },
  { border: 'border-yellow-500', bg: 'bg-yellow-50', darkBg: 'dark:bg-yellow-900/20', text: 'text-yellow-700', darkText: 'dark:text-yellow-300', ring: 'focus:ring-yellow-500' },
  { border: 'border-green-500', bg: 'bg-green-50', darkBg: 'dark:bg-green-900/20', text: 'text-green-700', darkText: 'dark:text-green-300', ring: 'focus:ring-green-500' },
  { border: 'border-cyan-500', bg: 'bg-cyan-50', darkBg: 'dark:bg-cyan-900/20', text: 'text-cyan-700', darkText: 'dark:text-cyan-300', ring: 'focus:ring-cyan-500' },
  { border: 'border-blue-500', bg: 'bg-blue-50', darkBg: 'dark:bg-blue-900/20', text: 'text-blue-700', darkText: 'dark:text-blue-300', ring: 'focus:ring-blue-500' },
  { border: 'border-purple-500', bg: 'bg-purple-50', darkBg: 'dark:bg-purple-900/20', text: 'text-purple-700', darkText: 'dark:text-purple-300', ring: 'focus:ring-purple-500' },
  { border: 'border-pink-500', bg: 'bg-pink-50', darkBg: 'dark:bg-pink-900/20', text: 'text-pink-700', darkText: 'dark:text-pink-300', ring: 'focus:ring-pink-500' },
];
