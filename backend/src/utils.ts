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

const normalizeEmail = (email: string) => {
    return email.toLowerCase().trim();
};

const normalizePhoneNo = (phoneNo: string) => {
    return phoneNo.trim().replace(/^0+/, "");
};

export { queryBuilderWithNullCond, normalizeEmail, normalizePhoneNo };
