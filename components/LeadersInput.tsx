'use client';

import { Users, ArrowRight } from "lucide-react";

interface LeadersInputProps {
    value: string;
    onChange: (value: string) => void;
    onApply: () => void;
}

export function LeadersInput({ value, onChange, onApply }: LeadersInputProps) {
    const count = value
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0).length;

    return (
        <div className="flex h-full flex-col">
            <div className="mb-2 flex items-center justify-between">
                <label
                    htmlFor="leaders-input"
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                    <Users className="h-4 w-4" />
                    Responsables ({count})
                </label>
            </div>
            <textarea
                id="leaders-input"
                className="flex-1 resize-none rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                placeholder={`Collez la liste des responsables ici...\nUn nom par ligne`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <button
                onClick={onApply}
                disabled={count === 0}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
                <span>Appliquer ({count} groupes)</span>
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    );
}
