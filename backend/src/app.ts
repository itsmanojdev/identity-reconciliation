import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

/* Middlewares */
app.use(express.json());

/* Error Middleware */
app.use(errorHandler);

export default app;
