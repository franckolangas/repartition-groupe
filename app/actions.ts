'use server';

import { shuffleArray, splitIntoGroups } from "@/lib/utils";

export async function generateGroups(participants: any[], groupCount: number): Promise<any[][]> {
  if (!participants || participants.length === 0) return [];
  if (groupCount < 1) return [participants];

  const shuffled = shuffleArray(participants);
  return splitIntoGroups(shuffled, groupCount);
}
