import { Router } from "express";
import { getPatientImages } from "../handler/couchdb_handler.js";

export const couchRouter = Router();

couchRouter.get("/", getPatientImages);