import express from "express";

const router = express.Router();

router.post("/identify", (req, res) => {
    res.status(200).json({"message" : "identify"})
})

export default router