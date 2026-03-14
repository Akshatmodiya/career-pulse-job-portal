const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Company name is required"], trim: true },
    slug: { type: String, unique: true, lowercase: true },
    industry: { type: String, trim: true },
    size: { type: String, trim: true },
    website: { type: String, trim: true },
    logo: { type: String, default: null },
    description: { type: String, trim: true },
    headquarters: { type: String, trim: true },
    founded: { type: Number },
    // Aggregated rating data (updated whenever a review is added/removed)
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    ratingBreakdown: {
      culture: { type: Number, default: 0 },
      salary: { type: Number, default: 0 },
      workLifeBalance: { type: Number, default: 0 },
      careerGrowth: { type: Number, default: 0 },
    },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate slug from name
CompanySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  }
  next();
});

module.exports = mongoose.model("Company", CompanySchema);
