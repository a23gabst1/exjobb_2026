import { config } from "dotenv"

config({ path: ".env" });

export const { PORT, MONGODB_URI, COUCHDB_URI } = process.env;