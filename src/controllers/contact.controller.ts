import { type Request, type Response } from "express";
import type { Contact, NewContact, ContactRequestBody, LinkPrecedence } from "../types.js";
import { normalizeEmail, normalizePhoneNo, getPrimary, mergeContacts, responseArrayFormat } from "../utils.js";
import { LINK_PRECEDENCE } from "../constants.js";
import { getAllLinkedContactsbyKey, createContact, convertPrimaryToSecondary } from "../models/contact.model.js";

const getIdentifyPage = (req: Request, res: Response) => {
    res.status(200).json({ message: "Identify Page" });
};

const identityReconciliation = async (req: Request<{}, {}, ContactRequestBody>, res: Response) => {
    try {
        let { phoneNumber: rawPhoneNo, email: rawEmail } = req.body;

        //Validation
        if (!rawPhoneNo && !rawEmail) {
            res.status(400).json({ error: "Either Phone Number or Email Is Required!!" });
            return;
        }

        if (rawPhoneNo && !/^\d+$/.test(rawPhoneNo)) {
            res.status(400).json({ error: "Phone Number Should be Numeric" });
            return;
        }

        //Normalization
        const email = rawEmail ? normalizeEmail(rawEmail) : null;
        const phoneNumber = rawPhoneNo ? normalizePhoneNo(rawPhoneNo) : null;

        //prettier-ignore
        const phoneRecords: Contact[] = phoneNumber ? await getAllLinkedContactsbyKey("phoneNumber", phoneNumber) : [];
        const emailRecords: Contact[] = email ? await getAllLinkedContactsbyKey("email", email) : [];
        const phoneExists = phoneRecords.length;
        const emailExists = emailRecords.length;

        let primaryRecord: Contact;
        let allRecords: Contact[] = [];

        if (!phoneExists && !emailExists) {
            //No Phone Record & No Email Record -> Insert new record(primary)
            let contactDetails: NewContact = {
                phoneNumber,
                email,
                linkedId: null,
                linkPrecedence: LINK_PRECEDENCE.PRIMARY as LinkPrecedence,
            };

            primaryRecord = (await createContact(contactDetails)).rows[0];
            allRecords = [primaryRecord];
        } else if (phoneExists && !emailExists) {
            //Phone Record Exists & No Email Record -> Insert new record(secondary) if email passed
            primaryRecord = getPrimary(phoneRecords)!;
            allRecords = [...phoneRecords];

            if (email) {
                let contactDetails: NewContact = {
                    phoneNumber,
                    email,
                    linkedId: primaryRecord.id,
                    linkPrecedence: LINK_PRECEDENCE.SECONDARY as LinkPrecedence,
                };

                let result: Contact = (await createContact(contactDetails)).rows[0];
                allRecords.push(result);
            }
        } else if (!phoneExists && emailExists) {
            //No Phone Record & Email Record Exists -> Insert new record(secondary) if phone number passed
            primaryRecord = getPrimary(emailRecords)!;
            allRecords = [...emailRecords];

            if (phoneNumber) {
                let contactDetails: NewContact = {
                    phoneNumber,
                    email,
                    linkedId: primaryRecord.id,
                    linkPrecedence: LINK_PRECEDENCE.SECONDARY as LinkPrecedence,
                };

                let result: Contact = (await createContact(contactDetails)).rows[0];
                allRecords.push(result);
            }
        } else {
            //Phone Record Exists & Email Record Exists
            let primary1 = getPrimary(phoneRecords);
            let primary2 = getPrimary(emailRecords);

            allRecords = mergeContacts(phoneRecords, emailRecords);

            if (primary1 && primary2 && primary1.id !== primary2.id) {
                let primaryDate1 = new Date(primary1.createdAt);
                let primaryDate2 = new Date(primary2.createdAt);

                if (primaryDate1 < primaryDate2) {
                    primaryRecord = primary1;
                } else if (primaryDate1 > primaryDate2) {
                    primaryRecord = primary2;
                } else {
                    primaryRecord = primary1.id <= primary2.id ? primary1 : primary2;
                }

                let secondaryRecord = primaryRecord.id == primary1.id ? primary2 : primary1;

                await convertPrimaryToSecondary(secondaryRecord.id, primaryRecord.id);
            } else {
                primaryRecord = primary1 ?? primary2!;
            }
        }

        let response = {
            primaryContatctId: primaryRecord.id,
            emails: responseArrayFormat(primaryRecord, allRecords, "email"),
            phoneNumbers: responseArrayFormat(primaryRecord, allRecords, "phoneNumber"),
            secondaryContactIds: responseArrayFormat(primaryRecord, allRecords, "id"),
        };
        res.status(200).json({ contact: response });
    } catch (error) {
        throw error;
    }
};

export { identityReconciliation, getIdentifyPage };
