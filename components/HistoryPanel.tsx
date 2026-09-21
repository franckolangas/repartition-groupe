'use client';

import { History, RotateCcw, Trash2, X } from "lucide-react";
import { Participant } from "@/lib/types";

export interface HistoryItem {
    id: string;
    timestamp: number;
    groups: Participant[][];
    leaders: Record<number, string>;
    groupNames?: Record<number, string>;
    groupCount: number;
}

interface HistoryPanelProps {
    history: HistoryItem[];
    onRestore: (item: HistoryItem) => void;
    onClear: () => void;
    isOpen: boolean;
    onClose: () => void;
}

export function HistoryPanel({ history, onRestore, onClear, isOpen, onClose }: HistoryPanelProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="h-full w-full max-w-md bg-white p-6 shadow-xl dark:bg-gray-900"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Historique</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {history.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center text-center text-gray-500">
                        <History className="mb-2 h-10 w-10 opacity-20" />
                        <p>Aucun historique disponible</p>
                    </div>
                ) : (
                    <div className="flex h-[calc(100vh-180px)] flex-col gap-4 overflow-y-auto">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {item.groups.length} groupes
                                    </span>
                                </div>
                                <div className="mb-3 text-xs text-gray-500">
                                    {item.groups.reduce((acc, g) => acc + g.length, 0)} participants
                                </div>
                                <button
                                    onClick={() => {
                                        onRestore(item);
                                        onClose();
                                    }}
                                    className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Restaurer
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {history.length > 0 && (
                    <div className="mt-6 border-t border-gray-100 pt-4 dark:border-gray-800">
                        <button
                            onClick={onClear}
                            className="flex w-full items-center justify-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                        >
                            <Trash2 className="h-4 w-4" />
                            Effacer l&apos;historique
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
