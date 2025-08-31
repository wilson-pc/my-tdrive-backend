import { TelegramClient } from "@mtcute/node";
import { Hono } from "hono";
import { db } from "../db/index.js";
import { decrypt, encrypt } from "../utils/encryptation.js";
const authRouter = new Hono();
const tg = new TelegramClient({
    apiId: process.env.TELEGRAM_ID ? Number(process.env.TELEGRAM_ID) : 0,
    apiHash: process.env.TELEGRAM_HASH ?? "",
});
authRouter.post("send-code", async (c) => {
    const { phone } = await c.req.json();
    await tg.sendCode({ phone });
    return c.json({ message: "otp code sended" });
});
authRouter.post("sign-in", async (c) => {
    const { code, externalId, phone } = await c.req.json();
    await tg.start({
        phone: phone, // Ensure full phone number is sent
        code: code,
    });
    const session = await tg.exportSession();
    const encrypted = encrypt(session);
    await db.execute({
        sql: "UPDATE users SET serverSession = ? WHERE externalId = ?",
        args: [encrypted, externalId],
    });
    return c.json({ message: session });
});
authRouter.post("get-me", async (c) => {
    const { externalId } = await c.req.json();
    const user = await db.execute({
        sql: "SELECT * FROM users WHERE externalId = ?",
        args: [externalId],
    });
    const data = user.rows[0];
    if (data && data.serverSession) {
        try {
            const session = decrypt(String(data.serverSession));
            const self = await tg.start({ session: session });
            console.log(self);
            return c.json({ success: true });
        }
        catch (error) {
            await db.execute({
                sql: "UPDATE users SET serverSession = ? WHERE externalId = ?",
                args: [null, externalId],
            });
            return c.json({ success: false });
        }
    }
    else {
        return c.json({ success: false });
    }
});
export default authRouter;
