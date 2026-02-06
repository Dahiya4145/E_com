import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        type: { type: String, default: "Full-time" }, // Full-time, Part-time, Contract, Internship
        location: { type: String, required: true },
        category: { type: String, required: true }, // Design, Marketing, Retail, etc.
        link: { type: String }, // Optional: external link or email mailto
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;
