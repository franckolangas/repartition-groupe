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
