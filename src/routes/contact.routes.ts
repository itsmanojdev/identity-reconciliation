import express from "express";
import { getIdentifyPage, identityReconciliation } from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/identify", getIdentifyPage);

router.post("/identify", identityReconciliation);

export default router;
