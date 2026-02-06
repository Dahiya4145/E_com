import express from "express";
import {
    getJobs,
    getAllJobsAdmin,
    getJobById,
    createJob,
    updateJob,
    deleteJob,
} from "../controllers/jobController.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(getJobs).post(verifyToken, verifyAdmin, createJob);
router.route("/admin").get(verifyToken, verifyAdmin, getAllJobsAdmin);
router
    .route("/:id")
    .get(getJobById)
    .put(verifyToken, verifyAdmin, updateJob)
    .delete(verifyToken, verifyAdmin, deleteJob);

export default router;
