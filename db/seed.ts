import { contactInfo } from "./data";
import * as db from "../src/config/db";
import { LINK_PRECEDENCE } from "../src/constants";
import { queryBuilderWithNullCond } from "../src/utils";

interface skippedIds {
    primaryIds: number[];
    primaryduplicates: number[];
    secondaryIds: number[];
    secondaryduplicates: number[];
    invalid: number[];
}

const seedContacts = async () => {
    try {
        let res = await db.query(`SELECT 1 FROM pg_type WHERE typname = 'link_precedence'`);

        if (!res.rowCount) {
            await db.query(`CREATE TYPE link_precedence AS ENUM('primary', 'secondary')`);
        }

        await db.query(`CREATE TABLE IF NOT EXISTS contact (
            id serial PRIMARY KEY,
            "phoneNumber" varchar(255),
            email varchar(255),
            "linkedId" integer,
            "linkPrecedence" link_precedence DEFAULT 'primary',
            "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP,
            "deletedAt" timestamp,
            FOREIGN KEY("linkedId") REFERENCES contact(id) ON DELETE CASCADE,
            UNIQUE("phoneNumber", email),
            CHECK ("phoneNumber" IS NOT NULL OR email IS NOT NULL)
        )`);

        let skippedIds: skippedIds = {
            primaryIds: [],
            primaryduplicates: [],
            secondaryIds: [],
            secondaryduplicates: [],
            invalid: [],
        };

        for (let index = 0; index < contactInfo.length; index++) {
            let contact = contactInfo[index];
            // primary - check id if not exist check email & phone no combo if not exist insert with id
            // secon - check primary list (linkedId) if not exist check email & phone no combo if not exist insert without id

            if (contact.linkPrecedence == LINK_PRECEDENCE.PRIMARY) {
                let res = await db.query(`SELECT id FROM contact WHERE id=$1`, [contact.id]);

                if (!res.rowCount) {
                    if (!(await handleInsertContact(contact))) {
                        skippedIds.primaryduplicates.push(contact.id);
                    }
                } else {
                    skippedIds.primaryIds.push(contact.id);
                }
            } else if (contact.linkPrecedence == LINK_PRECEDENCE.SECONDARY) {
                let res = await db.query(`SELECT id FROM contact WHERE id=$1`, [contact.id]);

                if (
                    !skippedIds.primaryIds.includes(contact.id) &&
                    !skippedIds.primaryduplicates.includes(contact.id) &&
                    !res.rowCount
                ) {
                    if (!(await handleInsertContact(contact))) {
                        skippedIds.secondaryduplicates.push(contact.id);
                    }
                } else {
                    skippedIds.secondaryIds.push(contact.id);
                }
            } else {
                skippedIds.invalid.push(contact.id);
            }
        }

        //Resetting id column of contact table
        await db.query(`SELECT setval('contact_id_seq', (SELECT MAX(id) FROM contact))`);
        console.log("Databased Seeded Successfully!!!", skippedIds);
    } catch (error) {
        console.log("Database Seeding Failed: ", error);
    }
};

const handleInsertContact = async (contact) => {
    let { query, values } = queryBuilderWithNullCond("contact", ["id"], {
        phoneNumber: contact.phoneNumber,
        email: contact.email,
    });

    let res = await db.query(query, values);

    if (!res.rowCount) {
        await db.query(
            `INSERT INTO contact(id, "phoneNumber", email, "linkedId", "linkPrecedence", "createdAt", "updatedAt", "deletedAt") 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                contact.id,
                contact.phoneNumber,
                contact.email,
                contact.linkedId,
                contact.linkPrecedence,
                contact.createdAt,
                contact.updatedAt,
                contact.deletedAt,
            ]
        );

        return true;
    }
    return false;
};

const seed = () => {
    seedContacts();
};

seed();
