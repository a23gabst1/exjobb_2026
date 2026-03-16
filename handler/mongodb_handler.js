import { MongoClient } from "mongodb";
import { MONGODB_URI } from "../config/config.js";
import { startTimer, stopTimer } from "../timer.js"

const client = new MongoClient(`${MONGODB_URI}`);

/**
 * Function that is responsible for returning all images connected to the specific patient via its ID
 * 
 * Wraps the query between the start and stop timer in an attempt to measure the time difference between receiving and completing the request
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns   
 */
async function getPatientImages(req, res) {
    const { patient_id } = req.params;

    try {
        await client.connect();
        const db = client.db("hospitaldb");
        const collection = db.collection("images");

        const startTime = startTimer();
        const patientImages = await collection.find({ patient_id: patient_id }).toArray();
        stopTimer(startTime, patient_id);

        return res.status(200).json({
            msg: "Successful read",
            images: patientImages
        });
    } catch (error) {
        console.error("Error on MongoDB Handler", error);
    } finally {
        await client.close();
    }
}

export { getPatientImages };