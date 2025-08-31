import { createClient } from "@libsql/client";
import 'dotenv/config';
export const db = createClient({
    url: process.env.TURSO_DATABASE_URL ?? '',
    authToken: process.env.TURSO_AUTH_TOKEN
});
