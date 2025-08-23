import express from "express";
import appRouters from "./routes/app.routes.js";
import contactRouters from "./routes/contact.js";

const app = express();

/* Middlewares */
app.use(express.json());

/* Routers */
app.use("/", appRouters);
app.use("/", contactRouters);

export default app;