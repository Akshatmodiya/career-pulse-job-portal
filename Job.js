const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    title: { type: String, required: [true, "Job title is required"], trim: true },
    type: { type: String, enum: ["Full-time", "Internship", "Contract", "Part-time"], required: true },
    location: { type: String, trim: true, default: "Remote" },
    description: { type: String, trim: true, maxlength: 5000 },
    skills: [{ type: String, trim: true }],
    salary: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: { type: String, default: "INR" },
    },
    experience: { type: String, default: "0-2 years" },
    isActive: { type: Boolean, default: true },
    applicants: { type: Number, default: 0 },
    deadline: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
