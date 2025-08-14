import express from "express";
import contactRouters from "./routes/contact.js";

const app = express();

const port = process.env.PORT ?? 3000;

/* Routers */
app.use("/", contactRouters);

/* Server Start */
app.listen(port, () => {
    console.log(`Backend Server Started. Listening at ${port}`);
})