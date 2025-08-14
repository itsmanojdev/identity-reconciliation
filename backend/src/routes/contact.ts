import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).json({"message" : "Home Page"});
})

router.post("/identify", (req, res) => {
    res.status(200).json({"message" : "identify"})
})

export default router