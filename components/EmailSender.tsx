import { useState } from "react";
import { Send, AlertCircle, CheckCircle, Loader2, XCircle } from "lucide-react";
import { Participant } from "@/lib/types";
import { sendBatchEmails } from "@/app/actions";

interface EmailSenderProps {
    groups: Participant[][];
    leaders: Record<number, string>;
    groupNames: Record<number, string>;
}

interface SendStats {
    total: number;
    sent: number;
    failed: number;
    skipped: number;
}

interface LogEntry {
    id: string;
    message: string;
    type: "info" | "success" | "error";
}

export function EmailSender({ groups, leaders, groupNames }: EmailSenderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [stats, setStats] = useState<SendStats>({ total: 0, sent: 0, failed: 0, skipped: 0 });
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [progress, setProgress] = useState(0);

    // Prepare data
    const participantsWithEmail = groups.flat().filter(p => p.email && p.email.includes("@"));
    const skippedCount = groups.flat().length - participantsWithEmail.length;

    const handleSend = async () => {
        setIsSending(true);
        setLogs([]);
        setStats({ total: participantsWithEmail.length, sent: 0, failed: 0, skipped: skippedCount });
        setProgress(0);

        const BATCH_SIZE = 5;
        const batches = [];

        // Create batches
        for (let i = 0; i < participantsWithEmail.length; i += BATCH_SIZE) {
            batches.push(participantsWithEmail.slice(i, i + BATCH_SIZE));
        }

        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const batchPayload = batch.map(p => {
                // Find group info
                const groupIndex = groups.findIndex(g => g.some(member => member.id === p.id));
                const groupName = groupNames[groupIndex] || `Groupe ${groupIndex + 1}`;
                const leaderName = leaders[groupIndex] || "Non défini";
                const members = groups[groupIndex].map(m => m.name).join(", ");

                const html = `
          <div style="font-family: sans-serif; color: #333;">
            <h2>Bonjour ${p.firstName || p.name},</h2>
            <p>Voici les détails de votre groupe pour la retraite :</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Groupe :</strong> ${groupName}</p>
              <p><strong>Responsable :</strong> ${leaderName}</p>
              <p><strong>Membres :</strong> ${members}</p>
            </div>
            <p>Bonne retraite !</p>
          </div>
        `;

                return {
                    to: p.email!,
                    subject: `Votre groupe : ${groupName}`,
                    html,
                    participantId: p.id
                };
            });

            setLogs(prev => [...prev, { id: crypto.randomUUID(), message: `Envoi du lot ${i + 1}/${batches.length}...`, type: "info" }]);

            const result = await sendBatchEmails(batchPayload);

            if (result.success && result.results) {
                let batchSuccess = 0;
                let batchFailed = 0;

                result.results.forEach((res: any) => {
                    if (res.success) {
                        batchSuccess++;
                    } else {
                        batchFailed++;
                        const p = batch.find(b => b.id === res.participantId);
                        setLogs(prev => [...prev, { id: crypto.randomUUID(), message: `Échec pour ${p?.name}: ${res.error}`, type: "error" }]);
                    }
                });

                setStats(prev => ({
                    ...prev,
                    sent: prev.sent + batchSuccess,
                    failed: prev.failed + batchFailed
                }));
            } else {
                setStats(prev => ({ ...prev, failed: prev.failed + batch.length }));
                setLogs(prev => [...prev, { id: crypto.randomUUID(), message: `Erreur critique lot ${i + 1}: ${result.error}`, type: "error" }]);
            }

            setProgress(((i + 1) / batches.length) * 100);
        }

        setIsSending(false);
        setLogs(prev => [...prev, { id: crypto.randomUUID(), message: "Terminé.", type: "success" }]);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Envoyer Emails</span>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Envoi des Emails</h2>

                {!isSending && progress === 0 ? (
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-300">
                            Vous êtes sur le point d'envoyer des emails à <strong>{participantsWithEmail.length}</strong> participants.
                        </p>
                        {skippedCount > 0 && (
                            <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                                <AlertCircle className="mr-2 inline h-4 w-4" />
                                {skippedCount} participants n'ont pas d'email et seront ignorés.
                            </div>
                        )}
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={participantsWithEmail.length === 0}
                                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                                Confirmer l'envoi
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                            <div className="rounded bg-green-50 p-2 dark:bg-green-900/20">
                                <div className="font-bold text-green-700 dark:text-green-300">{stats.sent}</div>
                                <div className="text-xs text-green-600 dark:text-green-400">Envoyés</div>
                            </div>
                            <div className="rounded bg-red-50 p-2 dark:bg-red-900/20">
                                <div className="font-bold text-red-700 dark:text-red-300">{stats.failed}</div>
                                <div className="text-xs text-red-600 dark:text-red-400">Échecs</div>
                            </div>
                            <div className="rounded bg-gray-50 p-2 dark:bg-gray-800">
                                <div className="font-bold text-gray-700 dark:text-gray-300">{stats.total}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                            </div>
                        </div>

                        <div className="max-h-40 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-2 text-xs font-mono dark:border-gray-800 dark:bg-gray-950">
                            {logs.map(log => (
                                <div key={log.id} className={`mb-1 ${log.type === 'error' ? 'text-red-600' :
                                    log.type === 'success' ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                    {log.message}
                                </div>
                            ))}
                        </div>

                        {!isSending && (
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    Fermer
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
