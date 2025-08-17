import express from "express";
import contactRouters from "./routes/contact.js";
import dotenv from 'dotenv'

dotenv.config({ path: '/backend/.env' })

const port = process.env.PORT ?? 3000;

const app = express();

/* Middlewares */
app.use(express.json());

/* Routers */
app.use("/", contactRouters);

/* Server Start */
app.listen(port, () => {
    console.log(`Backend Server Started. Listening at ${port}`);
})