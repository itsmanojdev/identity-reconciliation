import express from "express";
import appRouters from "./routes/app.routes.js";
import contactRouters from "./routes/contact.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

/* Middlewares */
app.use(express.json());

/* Routers */
app.use("/", appRouters);
app.use("/", contactRouters);

/* Error Middleware */
app.use(errorHandler);

export default app;
