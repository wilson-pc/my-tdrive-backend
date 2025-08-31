import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { Hono } from "hono";
import authRouter from "./controller/auth.controller.js";
import "dotenv/config";
import fileRouter from "./controller/file.controller.js";
const app = new Hono();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.use(cors({
    origin: ["http://localhost:5173", "https://mytdrive.hibapp.com"],
}));
app.get("/", (c) => {
    return c.text("Hello Hono!");
});
app.route("/auth", authRouter);
app.route("/file", fileRouter);
serve({
    fetch: app.fetch,
    port: PORT,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
