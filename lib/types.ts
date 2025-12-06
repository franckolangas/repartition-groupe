export interface Participant {
    id: string;
    name: string;
    // Extended fields from CSV
    lastName?: string;
    firstName?: string;
    email?: string;
    phone?: string;
    cityOrHouseChurch?: string;
    type?: string;
    registrationDate?: string;
    validationDate?: string;
    present?: boolean;
}
