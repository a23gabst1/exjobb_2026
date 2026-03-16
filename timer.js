import { __dirname, numOfDocuments, selectedDatabase } from "./server.js";
import path from "node:path";
import fs from "node:fs"

// Starts the first timer
function startTimer() {
    return process.hrtime.bigint();
}

// Stop the clock by calculating the time difference between the timers
// Both timers utilize the hrtime which is the most accurate clock by providing nanosecond (10^9) precision
function stopTimer(startTime, patientID) {
    const stopTime = process.hrtime.bigint();
    const deltaTime = stopTime - startTime;
    storeResult({ startTime, stopTime, deltaTime, patientID });
}

// Stores the result from the trial by appending to the current database file
// It stores the start clock, stop clock, time difference and patient id 
function storeResult(trialData) {
    const { startTime, stopTime, deltaTime, patientID } = trialData;
    const fullPath = path.join(__dirname, "measures", `${numOfDocuments}_${selectedDatabase}.csv`);
    const csvRow = `${startTime},${stopTime},${deltaTime},${patientID}\n`;

    fs.appendFile(fullPath, csvRow, (error) => {
        if (error) {
            console.error("Error when appending to file", error);
            return;
        }
        console.log("Trial data has been appended successfully!");
    });
}

export { startTimer, stopTimer };