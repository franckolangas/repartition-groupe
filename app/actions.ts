'use server';

import { shuffleArray, splitIntoGroups } from "@/lib/utils";
import { Participant } from "@/lib/types";
import { Resend } from 'resend';

export async function generateGroups(participants: Participant[], groupCount: number): Promise<Participant[][]> {
  if (!participants || participants.length === 0) return [];
  if (groupCount < 1) return [participants];

  const shuffled = shuffleArray(participants);
  return splitIntoGroups(shuffled, groupCount);
}


interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  participantId: string;
}

export async function sendBatchEmails(batch: EmailPayload[]) {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "Clé API Resend manquante (RESEND_API_KEY)" };
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    return { success: false, error: "Adresse expéditeur manquante (RESEND_FROM_EMAIL)" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Resend supports batch sending via a specific endpoint or just parallel requests.
  // The SDK has `resend.batch.send`? Let's check docs or assume parallel for now.
  // Actually, `resend.batch.send` is efficient. Let's try to use it if available, 
  // otherwise Promise.all.
  // To be safe and standard with the installed version, let's use Promise.all 
  // with individual sends, as it gives per-email status easily.

  const batchResults = [];

  for (const email of batch) {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: email.to,
        subject: email.subject,
        html: email.html,
      });

      if (error) {
        batchResults.push({ participantId: email.participantId, success: false, error: error.message });
      } else {
        batchResults.push({ participantId: email.participantId, success: true, id: data?.id });
      }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        batchResults.push({ participantId: email.participantId, success: false, error: message });
    }

    // Rate limiting: wait 600ms between emails
    if (batch.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 600));
    }
  }

  return { success: true, results: batchResults };
}
