import { type Request, type Response } from "express";

const getIdentifyPage = (req: Request, res: Response) => {
    res.status(200).json({ message: "Identify Page" });
};

const identityReconciliation = async (req: Request, res: Response) => {};

export { identityReconciliation, getIdentifyPage };
