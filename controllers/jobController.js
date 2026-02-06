import Job from "../models/Job.js";

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get all jobs (Admin)
// @route   GET /api/jobs/admin
// @access  Private/Admin
export const getAllJobsAdmin = async (req, res) => {
    try {
        const jobs = await Job.find({}).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (job) {
            res.json(job);
        } else {
            res.status(404).json({ message: "Job not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Admin
export const createJob = async (req, res) => {
    try {
        const { title, type, location, category, link, isActive } = req.body;

        const job = new Job({
            title,
            type,
            location,
            category,
            link,
            isActive,
        });

        const createdJob = await job.save();
        res.status(201).json(createdJob);
    } catch (error) {
        res.status(400).json({ message: "Invalid job data", error: error.message });
    }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
export const updateJob = async (req, res) => {
    try {
        const { title, type, location, category, link, isActive } = req.body;
        const job = await Job.findById(req.params.id);

        if (job) {
            job.title = title || job.title;
            job.type = type || job.type;
            job.location = location || job.location;
            job.category = category || job.category;
            job.link = link || job.link;
            job.isActive = isActive !== undefined ? isActive : job.isActive;

            const updatedJob = await job.save();
            res.json(updatedJob);
        } else {
            res.status(404).json({ message: "Job not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (job) {
            await job.deleteOne();
            res.json({ message: "Job removed" });
        } else {
            res.status(404).json({ message: "Job not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
