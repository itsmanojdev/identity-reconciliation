type LinkPrecedence = "primary" | "secondary";

interface ContactRequestBody {
    phoneNumber: string | null;
    email: string | null;
}

interface NewContact {
    phoneNumber: string | null;
    email: string | null;
    linkedId: number | null;
    linkPrecedence: LinkPrecedence;
}

interface Contact extends NewContact {
    id: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export type { ContactRequestBody, NewContact, Contact, LinkPrecedence };
