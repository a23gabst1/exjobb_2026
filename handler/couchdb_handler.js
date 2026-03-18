import { COUCHDB_URI } from "../config/config.js"
import nano from "nano";
import { startTimer, stopTimer } from "../timer.js"

const client = nano(`${COUCHDB_URI}`);

/**
 * Function that is responsible to returns images related to a specific patient via its id
 * 
 * Uses the two timers (startTimer & stopTimer) in an attempt to capture the time difference between receiving and completing the request
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
async function getPatientImages(req, res) {
    const { patient_id } = req.params;

    try {
        const db = client.db.use('hospitaldb');
        const mangoQuery = {
            selector: {
                patient_id: { "$eq": patient_id },
                content_type: { "$eq": "image/jpeg" }
            }
        };

        const startTime = startTimer();
        const response = await db.find(mangoQuery);
        stopTimer(startTime, patient_id);

        const responseImages = response.docs.slice(0, 9);

        return res.status(200).json({
            msg: "Successful read!",
            images: responseImages
        });
    } catch (error) {
        console.error("Error on couchdb handler", error);
        return res.status(500).json({
            msg: "Something went wrong!"
        });
    }
}

export { getPatientImages };