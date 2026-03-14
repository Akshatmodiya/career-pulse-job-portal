const Job = require("../models/Job");

exports.getAllJobs = async (req, res) => {
  try {
    const { type, location, skill, sort = "-createdAt", page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (skill) filter.skills = { $regex: skill, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [jobs, total] = await Promise.all([
      Job.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).populate("company", "name logo avgRating industry"),
      Job.countDocuments(filter),
    ]);

    res.json({ success: true, count: jobs.length, total, totalPages: Math.ceil(total / parseInt(limit)), data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("company", "name logo avgRating industry description");
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    res.json({ success: true, message: "Job deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
