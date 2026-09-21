import { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { Participant } from "@/lib/types";

type CsvRow = Record<string, string | undefined>;

interface CsvImportButtonProps {
    onImport: (participants: Participant[]) => void;
}

export function CsvImportButton({ onImport }: CsvImportButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);

        Papa.parse<CsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedParticipants: Participant[] = [];

                results.data.forEach((row) => {
                    // Map CSV columns to Participant fields
                    // Expected columns: Nom, Prénom, City of residence (Guest) / House church (Member), Email, Téléphone, Type, Date d'inscription, Date de validation, Présent

                    const lastName = row["Nom"]?.trim() || "";
                    const firstName = row["Prénom"]?.trim() || "";

                    if (!lastName && !firstName) return; // Skip empty rows

                    const fullName = `${firstName} ${lastName}`.trim();

                    const participant: Participant = {
                        id: crypto.randomUUID(),
                        name: fullName,
                        lastName: lastName,
                        firstName: firstName,
                        cityOrHouseChurch: row["City of residence (Guest) / House church (Member)"]?.trim(),
                        email: row["Email"]?.trim(),
                        phone: row["Téléphone"]?.trim(),
                        type: row["Type"]?.trim(),
                        registrationDate: row["Date d'inscription"]?.trim(),
                        validationDate: row["Date de validation"]?.trim(),
                        present: parseBoolean(row["Présent"]),
                    };

                    parsedParticipants.push(participant);
                });

                onImport(parsedParticipants);
                setIsImporting(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            },
            error: (error) => {
                console.error("CSV Import Error:", error);
                alert("Erreur lors de l'import du fichier CSV.");
                setIsImporting(false);
            }
        });
    };

    const parseBoolean = (value: string | undefined): boolean => {
        if (typeof value === "boolean") return value;
        if (!value) return false;
        const str = String(value).trim().toLowerCase();
        return str === "true" || str === "oui" || str === "yes" || str === "1";
    };

    return (
        <>
            <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
                title="Importer un fichier CSV"
            >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">{isImporting ? "Import..." : "Importer CSV"}</span>
            </button>
        </>
    );
}
