import { Router } from "express";
import { getPatientImages } from "../handler/mongodb_handler.js";

export const mongoRouter = Router();

mongoRouter.get("/:patient_id", getPatientImages);