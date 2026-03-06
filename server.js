import express from "express"
import { PORT } from "./config/config.js"
import { fileURLToPath } from "node:url"
import path from "node:path"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Express middlewares
app.use(express.json()); // Only parses JSON
app.use(express.static(path.join(__dirname, "public"))); //Serves static files

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});