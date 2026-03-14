const mongoose = require("mongoose");

const EmployeeExperienceSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company reference is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    employeeName: {
      type: String,
      default: "Anonymous",
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
      maxlength: 120,
    },
    employmentType: {
      type: String,
      enum: ["Full-time", "Internship", "Contract"],
      required: [true, "Employment type is required"],
    },
    duration: {
      type: String,
      trim: true,
      default: "Not specified",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    pros: {
      type: String,
      required: [true, "Pros are required"],
      trim: true,
      maxlength: 1000,
    },
    cons: {
      type: String,
      required: [true, "Cons are required"],
      trim: true,
      maxlength: 1000,
    },
    advice: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    recommend: {
      type: Boolean,
      default: true,
    },
    ratingBreakdown: {
      culture: { type: Number, min: 1, max: 5, default: 3 },
      salary: { type: Number, min: 1, max: 5, default: 3 },
      workLifeBalance: { type: Number, min: 1, max: 5, default: 3 },
      careerGrowth: { type: Number, min: 1, max: 5, default: 3 },
    },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isReported: { type: Boolean, default: false },
    reportedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isApproved: { type: Boolean, default: true },
    isVerifiedEmployee: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// After saving a review, update the company's aggregate rating
EmployeeExperienceSchema.post("save", async function () {
  await updateCompanyRating(this.company);
});

EmployeeExperienceSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await updateCompanyRating(doc.company);
});

async function updateCompanyRating(companyId) {
  const Company = require("./Company");
  const reviews = await mongoose.model("EmployeeExperience").find({
    company: companyId,
    isApproved: true,
  });

  if (reviews.length === 0) {
    await Company.findByIdAndUpdate(companyId, {
      avgRating: 0,
      totalReviews: 0,
      ratingBreakdown: { culture: 0, salary: 0, workLifeBalance: 0, careerGrowth: 0 },
    });
    return;
  }

  const avg = (field) =>
    parseFloat((reviews.reduce((s, r) => s + (r.ratingBreakdown?.[field] || r.rating), 0) / reviews.length).toFixed(1));

  const avgRating = parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1));

  await Company.findByIdAndUpdate(companyId, {
    avgRating,
    totalReviews: reviews.length,
    ratingBreakdown: {
      culture: avg("culture"),
      salary: avg("salary"),
      workLifeBalance: avg("workLifeBalance"),
      careerGrowth: avg("careerGrowth"),
    },
  });
}

module.exports = mongoose.model("EmployeeExperience", EmployeeExperienceSchema);
