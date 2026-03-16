import { __dirname } from "./server.js";

// Starts the first timer
function startTimer() {
    return process.hrtime.bigint();
}

// Stop the clock by calculating the time difference between the timers
// Both timers utilize the hrtime which is the most accurate clock by providing nanosecond (10^9) precision
function stopTimer(startTime, patientID) {
    return process.hrtime.bigint() - startTime;
}

export { startTimer, stopTimer };