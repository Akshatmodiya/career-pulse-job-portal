const Company = require("../models/Company");
const EmployeeExperience = require("../models/EmployeeExperience");

// ── GET /api/companies ────────────────────────────────────
exports.getAllCompanies = async (req, res) => {
  try {
    const { industry, sort = "-avgRating", page = 1, limit = 12, q } = req.query;
    const filter = {};
    if (industry) filter.industry = { $regex: industry, $options: "i" };
    if (q) filter.name = { $regex: q, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [companies, total] = await Promise.all([
      Company.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Company.countDocuments(filter),
    ]);

    res.json({ success: true, count: companies.length, total, totalPages: Math.ceil(total / parseInt(limit)), data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/companies/:id ────────────────────────────────
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/companies/slug/:slug ─────────────────────────
exports.getCompanyBySlug = async (req, res) => {
  try {
    const company = await Company.findOne({ slug: req.params.slug });
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/companies ───────────────────────────────────
exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ success: true, data: company });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/companies/:id ────────────────────────────────
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/companies/:id ─────────────────────────────
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });
    await EmployeeExperience.deleteMany({ company: req.params.id });
    res.json({ success: true, message: "Company and all its reviews deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
