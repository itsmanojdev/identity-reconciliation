import type { Contact } from "./types.js";
import { LINK_PRECEDENCE } from "./constants.js";

const queryBuilderWithNullCond = (
    table: string,
    selectColumns: string[],
    columns: { [index: string]: string | number | null }
) => {
    const keys = Object.keys(columns);

    let query = `SELECT ${selectColumns.join(",")} FROM ${table}`;
    query += keys.length ? " WHERE " : "";

    const values: (string | number)[] = [];
    let condCount = 1;

    keys.forEach((key, ind) => {
        if (columns[key] === null) {
            query += `"${key}" IS NULL`;
        } else {
            query += `"${key}" = $${condCount}`;
            condCount++;
            values.push(columns[key]!);
        }

        query += ind != keys.length - 1 ? " AND " : "";
    });

    return { query, values };
};

const queryColConcat = (selectCol: string[]) => {
    if (selectCol.length) {
        let colQuery = ``;
        selectCol.forEach((col, ind) => {
            colQuery += `"${col}"`;
            if (ind != selectCol.length - 1) colQuery += `, `;
        });
        return colQuery;
    }
    return `*`;
};

const normalizeEmail = (email: string) => {
    return email.toLowerCase().trim();
};

const normalizePhoneNo = (phoneNo: string) => {
    return phoneNo.trim().replace(/^0+/, "");
};

const getPrimary = (records: Contact[]) => {
    return records.find((r) => r.linkPrecedence == LINK_PRECEDENCE.PRIMARY);
};

const mergeContacts = (...contactsArrays: Contact[][]) => {
    let mergeContacts = new Map<number, Contact>();
    for (const contacts of contactsArrays) {
        for (const record of contacts) {
            mergeContacts.set(record.id, record);
        }
    }
    return Array.from(mergeContacts.values());
};

const responseArrayFormat = <K extends keyof Contact>(primaryRecord: Contact, records: Contact[], filterCol: K) => {
    if (filterCol == "id") {
        //prettier-ignore
        return records
            .filter((record) => record.id != primaryRecord.id)
            .map((record) => record[filterCol]);
    }

    let primaryArr = primaryRecord[filterCol] ? [primaryRecord[filterCol]] : [];
    let secondaryArr = records
        .filter((record) => record.id != primaryRecord.id && Boolean(record[filterCol]))
        .map((record) => record[filterCol]);

    return [...new Set([...primaryArr, ...secondaryArr])];
};

export {
    queryBuilderWithNullCond,
    normalizeEmail,
    normalizePhoneNo,
    queryColConcat,
    getPrimary,
    mergeContacts,
    responseArrayFormat,
};
