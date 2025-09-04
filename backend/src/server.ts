import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({ path: "/backend/.env" });

const port = process.env.PORT ?? 3000;

/* Server Start */
app.listen(port, () => {
    console.log(`Backend Server Started. Listening at ${port}`);
});
