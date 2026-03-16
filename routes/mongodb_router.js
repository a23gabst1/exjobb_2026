import { Router } from "express";
import { getPatientImages } from "../handler/mongodb_handler";

export const mongoRouter = Router();

mongoRouter.get("/", getPatientImages);