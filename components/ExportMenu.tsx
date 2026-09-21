'use client';

import { useState } from 'react';
import {
    Printer,
    FileDown,
    Copy,
    Maximize,
    Check,
    FileSpreadsheet,
    Monitor
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportMenuProps {
    groups: string[][];
    leaders: Record<number, string>;
}

export function ExportMenu({ groups, leaders }: ExportMenuProps) {
    const [copied, setCopied] = useState(false);

    if (!groups.length) return null;

    const handlePrint = () => {
        window.print();
    };

    const handlePDF = () => {
        const doc = new jsPDF();

        groups.forEach((group, index) => {
            if (index > 0) doc.addPage();

            const groupName = `Groupe ${index + 1}`;
            const leaderName = leaders[index] || "Non défini";

            doc.setFontSize(22);
            doc.setTextColor(41, 128, 185);
            doc.text(groupName, 14, 22);
            doc.setFontSize(11);
            doc.setTextColor(70, 70, 70);
            doc.text(`Responsable : ${leaderName}`, 14, 31);
            doc.text(`${group.length} participant${group.length > 1 ? "s" : ""}`, 14, 38);

            autoTable(doc, {
                startY: 46,
                head: [["N°", "Participant"]],
                body: group.map((member, memberIndex) => [memberIndex + 1, member]),
                styles: { fontSize: 12, cellPadding: 4 },
                headStyles: { fillColor: [41, 128, 185] },
                columnStyles: { 0: { cellWidth: 18 } },
            });
        });

        doc.save('groupes-repartition.pdf');
    };

    const handleCopy = async () => {
        let text = "📋 Répartition des groupes\n\n";

        groups.forEach((group, index) => {
            const leaderName = leaders[index] ? `👑 ${leaders[index]}` : "";
            text += `*Groupe ${index + 1}* (${group.length} pers.) ${leaderName}\n`;
            group.forEach(member => {
                text += `- ${member}\n`;
            });
            text += "\n";
        });

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCSV = () => {
        let csvContent = "\uFEFFGroupe,Responsable,Membre\n";

        groups.forEach((group, index) => {
            const groupName = `Groupe ${index + 1}`;
            const leaderName = leaders[index] || "";

            group.forEach(member => {
                const row = [
                    groupName,
                    leaderName,
                    member
                ].map(cell => `"${cell.replace(/"/g, '""')}"`).join(",");
                csvContent += row + "\n";
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "groupes_repartition.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    const handlePresentation = () => {
        window.open('/presentation', '_blank');
    };

    return (
        <div className="mb-6 flex flex-wrap gap-2 print:hidden">
            <button
                onClick={handlePresentation}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                title="Mode présentation"
            >
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Mode présentation</span>
            </button>

            <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                title="Imprimer"
            >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
                onClick={handlePDF}
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                title="Télécharger PDF"
            >
                <FileDown className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
            </button>

            <button
                onClick={handleCSV}
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                title="Télécharger CSV"
            >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">CSV</span>
            </button>

            <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                title="Copier pour WhatsApp/Email"
            >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                <span className="hidden sm:inline">{copied ? "Copié !" : "Copier"}</span>
            </button>

            <button
                onClick={handleFullscreen}
                className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                title="Plein écran"
            >
                <Maximize className="h-4 w-4" />
                <span className="hidden sm:inline">Plein écran</span>
            </button>
        </div>
    );
}
