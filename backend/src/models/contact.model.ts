import * as db from "../config/db.js";
import { queryColConcat } from "../utils.js";
import type { Contact, NewContact } from "../types.js";
import { LINK_PRECEDENCE } from "../constants.js";

const getAllLinkedContactsbyKey = async (key: string, value: string, selectCol: string[] = []) => {
    let colQuery = queryColConcat(selectCol);

    let records: Contact[] = (
        await db.query(`SELECT ${colQuery} FROM contact WHERE "${key}" = $1 AND "deletedAt" IS NULL`, [value])
    ).rows;

    if (records.length) {
        let ids = records.map((rec) => rec.id);
        let linkedIds = records.map((rec) => rec.linkedId).filter((id) => id != null);

        let relatedIds = [...new Set([...ids, ...linkedIds])];

        let linkedContacts = (
            await db.query(
                `SELECT ${colQuery} FROM contact WHERE (id = ANY($1) OR "linkedId" = ANY($1)) AND "deletedAt" IS NULL`,
                [relatedIds]
            )
        ).rows;

        return linkedContacts;
    }
    return records;
};

const createContact = async (contact: NewContact) => {
    return await db.query(
        `INSERT INTO contact("phoneNumber", email, "linkedId", "linkPrecedence", "createdAt", "updatedAt") 
            VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
        [contact.phoneNumber, contact.email, contact.linkedId, contact.linkPrecedence]
    );
};

const convertPrimaryToSecondary = async (recordId: number, primaryId: number) => {
    return await db.query(
        `UPDATE contact SET "linkedId" = $1, "linkPrecedence" = $2, "updatedAt" = $3 WHERE id = $4 OR "linkedId" = $4`,
        [primaryId, LINK_PRECEDENCE.SECONDARY, new Date().toISOString(), recordId]
    );
};

export { getAllLinkedContactsbyKey, createContact, convertPrimaryToSecondary };
