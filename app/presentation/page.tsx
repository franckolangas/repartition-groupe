'use client';

import { useState, useEffect } from "react";
import { Participant } from "@/lib/types";
import { GROUP_COLORS } from "@/lib/utils";

export default function PresentationPage() {
    const [groups, setGroups] = useState<Participant[][]>([]);
    const [leaders, setLeaders] = useState<Record<number, string>>({});
    const [groupNames, setGroupNames] = useState<Record<number, string>>({});
    const [mounted, setMounted] = useState(false);

    const loadData = () => {
        const savedGroups = localStorage.getItem("groups");
        const savedLeaders = localStorage.getItem("leaders");
        const savedGroupNames = localStorage.getItem("groupNames");

        if (savedGroups) {
            const parsed = JSON.parse(savedGroups);
            // Migration check for presentation page too
            if (parsed.length > 0 && parsed[0].length > 0 && typeof parsed[0][0] === 'string') {
                const migrated = parsed.map((g: string[]) => g.map((name: string) => ({ id: crypto.randomUUID(), name })));
                setGroups(migrated);
            } else {
                setGroups(parsed);
            }
        }
        if (savedLeaders) setLeaders(JSON.parse(savedLeaders));
        if (savedGroupNames) setGroupNames(JSON.parse(savedGroupNames));
    };

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            loadData();
            setMounted(true);
        });

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "groups" || e.key === "leaders" || e.key === "groupNames") {
                loadData();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    if (!mounted) return null;

    if (!groups.length) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
                <p className="text-2xl text-gray-400">En attente de groupes...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-950 p-8 text-gray-100">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groups.map((group, index) => {
                    const color = GROUP_COLORS[index % GROUP_COLORS.length];
                    return (
                        <div
                            key={index}
                            className={`flex flex-col rounded-xl border p-6 shadow-lg ${color.border} ${color.bg} ${color.darkBg}`}
                        >
                            <div className="mb-4 flex items-center justify-between border-b border-gray-800 pb-4">
                                <h2 className="text-2xl font-bold text-blue-400">
                                    {groupNames[index] || `Groupe ${index + 1}`}
                                </h2>
                                <span className="rounded-full bg-gray-800 px-3 py-1 text-sm font-medium text-gray-400">
                                    {group.length}
                                </span>
                            </div>

                            {leaders[index] && (
                                <div className="mb-4 rounded-lg bg-blue-900/20 p-3 text-blue-200">
                                    <span className="mr-2 font-bold">👑 Responsable:</span>
                                    {leaders[index]}
                                </div>
                            )}

                            <ul className="flex-1 space-y-3">
                                {group.map((participant) => (
                                    <li key={participant.id} className="text-xl text-gray-300">
                                        {participant.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
