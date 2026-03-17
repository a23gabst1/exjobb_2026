import express from "express"
import { PORT } from "./config/config.js"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { mongoRouter } from "./routes/mongodb_router.js"
import { couchRouter } from "./routes/couchdb_router.js"
import { writeFile } from "node:fs/promises"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const docSizes = {
    "9": "1M",
    "49": "5M",
    "99": "10M"
};

const numOfDocuments = docSizes[process.env.DOC_SIZE];
let selectedDatabase = null;

// Express middlewares
app.use(express.json()); // Only parses JSON
app.use("/public", express.static(path.join(__dirname, "public"))); //Serves static files

// User defined routes - one for each database
app.use("/mongodb", mongoRouter);
app.use("/couchdb", couchRouter);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Endpoint that initializes the experiment
// Creates the file to store the results
app.get("/init_experiment", async (req, res) => {
    const { database } = req.query;
    selectedDatabase = database;

    try {
        const csvHeader = "old,new,delta,patient_id\n";
        const resultFolder = "measures";
        const fullPath = path.join(__dirname, resultFolder, `${numOfDocuments}_${selectedDatabase}.csv`);
        await writeFile(fullPath, csvHeader);

        return res.status(200).json({
            msg: "Start the experiment",
            start: true
        });
    } catch (error) {
        console.error("Error when creating the file (init_experiment - endpoint)", error);
    }
});

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});

export { numOfDocuments, selectedDatabase, __dirname };