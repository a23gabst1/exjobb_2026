import express from "express"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { mongoRouter } from "./routes/mongodb_router.js"
import { couchRouter } from "./routes/couchdb_router.js"
import { writeFile } from "node:fs/promises"
import { execFile } from "node:child_process"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

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
        const fullPath = path.join(__dirname, resultFolder, `${selectedDatabase}.csv`);
        await writeFile(fullPath, csvHeader);

        return res.status(200).json({
            msg: "Start the experiment",
            start: true
        });
    } catch (error) {
        console.error("Error when creating the file (init_experiment - endpoint)", error);
        return res.status(500).json({
            msg: "Do not start the experiment",
            start: false
        });
    }
});

/**
 * Server sent events - informs the user which database could only be measured and evaluated on the web interface
 */
app.get("/db_events", (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const intervalID = setInterval(() => {
        res.write(`data: DB ${process.env.DB}\n\n`);
    }, 100);

    req.on("close", () => {
        clearInterval(intervalID);
        res.end();
    });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});

/**
 * Function that cleans up by closing down the services and the express server
 * 
 * @param {string} signal 
 */
function cleanUpNExit(signal) {
    console.log(`Handling signal: ${signal}`);
    execFile("bash", [path.join(__dirname, "scripts", `destroy_clusters.sh`), `${process.env.DB}`], (error, stdout, stderr) => {
        if (error) {
            console.error("Error", error.message);
        }

        if (stderr) {
            console.error("Stderr", stderr);
        }

        console.log("Output: ", stdout);

        server.close(() => {
            console.log("Closing down server...");
            process.exit(0);
        });
    });
}

process.once("SIGINT", () => {
    cleanUpNExit("SIGINT");
});

process.once("SIGTERM", () => {
    cleanUpNExit("SIGTERM");
});

export { selectedDatabase, __dirname };