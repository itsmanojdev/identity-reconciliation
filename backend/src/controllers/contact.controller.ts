import { type Request, type Response } from "express";
import type { ContactRequestBody } from "../types.js";
import { normalizeEmail, normalizePhoneNo } from "../utils.js";

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
    } catch (error) {
        throw error;
    }
};

export { identityReconciliation, getIdentifyPage };
