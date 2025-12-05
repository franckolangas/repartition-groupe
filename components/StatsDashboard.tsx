'use client';

import { BarChart3, Users, Scale, AlertTriangle } from "lucide-react";

interface StatsDashboardProps {
    groups: string[][];
    onBalance: () => void;
}

export function StatsDashboard({ groups, onBalance }: StatsDashboardProps) {
    if (!groups.length) return null;

    const totalParticipants = groups.reduce((acc, group) => acc + group.length, 0);
    const groupSizes = groups.map(g => g.length);
    const minSize = Math.min(...groupSizes);
    const maxSize = Math.max(...groupSizes);
    const avgSize = (totalParticipants / groups.length).toFixed(1);
    const isUnbalanced = maxSize - minSize > 1;

    return (
        <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900 p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-gray-100">Statistiques</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-md bg-gray-800 p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Users className="h-3 w-3" />
                        Total
                    </div>
                    <p className="mt-1 text-xl font-bold text-gray-100">
                        {totalParticipants}
                    </p>
                </div>

                <div className="rounded-md bg-gray-800 p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Scale className="h-3 w-3" />
                        Moyenne
                    </div>
                    <p className="mt-1 text-xl font-bold text-gray-100">
                        {avgSize}
                    </p>
                </div>

                <div className="rounded-md bg-gray-800 p-3">
                    <div className="text-xs text-gray-400">
                        Plus petit
                    </div>
                    <p className="mt-1 text-xl font-bold text-gray-100">
                        {minSize}
                    </p>
                </div>

                <div className="rounded-md bg-gray-800 p-3">
                    <div className="text-xs text-gray-400">
                        Plus grand
                    </div>
                    <p className="mt-1 text-xl font-bold text-gray-100">
                        {maxSize}
                    </p>
                </div>
            </div>

            {isUnbalanced && (
                <div className="mt-4 flex items-center justify-between rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Attention : Les groupes sont déséquilibrés (écart {maxSize - minSize})</span>
                    </div>
                    <button
                        onClick={onBalance}
                        className="rounded-md bg-yellow-100 px-3 py-1.5 text-xs font-medium text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-100 dark:hover:bg-yellow-900/60"
                    >
                        Équilibrer automatiquement
                    </button>
                </div>
            )}
        </div>
    );
}
