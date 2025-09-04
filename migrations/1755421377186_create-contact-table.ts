import { MigrationBuilder } from "node-pg-migrate";

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm: MigrationBuilder): Promise<void> | void => {
    // Type for Link Precedence
    pgm.createType("link_precedence", ["primary", "secondary"]);

    pgm.createTable("contact", {
        id: "id",
        phoneNumber: "varchar(255)",
        email: "varchar(255)",
        linkedId: {
            type: "integer",
            references: "contact",
            onDelete: "CASCADE",
        },
        linkPrecedence: {
            type: "link_precedence",
            default: "primary",
        },
        createdAt: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        updatedAt: {
            type: "timestamp",
            notNull: true,
            default: pgm.func("current_timestamp"),
        },
        deletedAt: "timestamp",
    });

    pgm.addConstraint("contact", "unique_phone_or_email", {
        unique: ["phoneNumber", "email"],
    });

    pgm.addConstraint("contact", "null_contraint", {
        check: '"phoneNumber" IS NOT NULL OR email IS NOT NULL',
    });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm: MigrationBuilder): Promise<void> | void => {
    pgm.dropTable("contact", {
        ifExists: true,
    });

    pgm.dropType("link_precedence", {
        ifExists: true,
    });
};
