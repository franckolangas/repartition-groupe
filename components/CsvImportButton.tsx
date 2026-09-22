import { useState, useRef } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";
import { Participant } from "@/lib/types";

type CsvRow = Record<string, string | undefined>;

interface CsvImportButtonProps {
    onImport: (participants: Participant[]) => void;
}

export function CsvImportButton({ onImport }: CsvImportButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    const createParticipants = (rows: CsvRow[]): Participant[] => {
        return rows.flatMap((row) => {
            const lastName = getValue(row, ["Nom", "Nom de famille", "Last name"]);
            const firstName = getValue(row, ["Prénom", "Prenom", "First name"]);

            if (!lastName && !firstName) return [];

            return [{
                id: crypto.randomUUID(),
                name: `${firstName} ${lastName}`.trim(),
                lastName: lastName || undefined,
                firstName: firstName || undefined,
                cityOrHouseChurch: getValue(row, ["City of residence (Guest) / House church (Member)", "Ville", "City"]),
                email: getValue(row, ["Email", "E-mail", "Adresse email"]),
                phone: getValue(row, ["Téléphone", "Telephone", "Phone"]),
                type: getValue(row, ["Type"]),
                registrationDate: getValue(row, ["Date d'inscription", "Date inscription"]),
                validationDate: getValue(row, ["Date de validation"]),
                present: parseBoolean(getValue(row, ["Présent", "Present"])) ,
            }];
        });
    };

    const getValue = (row: CsvRow, keys: string[]) => {
        const entry = Object.entries(row).find(([key]) =>
            keys.some((wantedKey) => key.trim().toLowerCase() === wantedKey.toLowerCase()),
        );
        return entry?.[1]?.trim() || "";
    };

    const parseCsv = (file: File): Promise<Participant[]> => new Promise((resolve, reject) => {
        Papa.parse<CsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(createParticipants(results.data)),
            error: reject,
        });
    });

    const parseExcel = async (file: File): Promise<Participant[]> => {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
        const rows = XLSX.utils.sheet_to_json<CsvRow>(workbook.Sheets[workbook.SheetNames[0]], {
            defval: "",
        });
        return createParticipants(rows);
    };

    const parsePdf = async (file: File): Promise<Participant[]> => {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
        const rows: CsvRow[] = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
            const page = await pdf.getPage(pageNumber);
            const content = await page.getTextContent();
            content.items.forEach((item) => {
                if ("str" in item && item.str.trim()) rows.push({ Nom: item.str.trim() });
            });
        }

        return createParticipants(rows);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);

        try {
            const extension = file.name.split(".").pop()?.toLowerCase();
            const parsedParticipants = extension === "pdf"
                ? await parsePdf(file)
                : extension === "xlsx" || extension === "xls"
                    ? await parseExcel(file)
                    : await parseCsv(file);

            if (parsedParticipants.length === 0) {
                throw new Error("Aucun participant reconnu dans ce fichier.");
            }

            onImport(parsedParticipants);
        } catch (error) {
            console.error("Import Error:", error);
            alert("Impossible de lire ce fichier. Pour un PDF, utilisez un document avec du texte sélectionnable.");
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
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
                accept=".csv,.xlsx,.xls,.pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
                title="Importer un CSV, Excel ou PDF"
            >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">{isImporting ? "Import..." : "Importer fichier"}</span>
            </button>
        </>
    );
}
