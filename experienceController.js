const EmployeeExperience = require("../models/EmployeeExperience");
const Company = require("../models/Company");

// ── POST /api/experiences/add-experience ──────────────────
exports.addExperience = async (req, res) => {
  try {
    const {
      company, role, employmentType, duration,
      rating, pros, cons, advice, recommend, ratingBreakdown,
    } = req.body;

    // Validate company exists
    const companyDoc = await Company.findById(company);
    if (!companyDoc)
      return res.status(404).json({ success: false, message: "Company not found." });

    const exp = await EmployeeExperience.create({
      company,
      user: req.user?._id || null,
      employeeName: req.user?.name || "Anonymous",
      role,
      employmentType,
      duration,
      rating,
      pros,
      cons,
      advice,
      recommend,
      ratingBreakdown,
      isVerifiedEmployee: req.user?.isVerified || false,
    });

    const populated = await exp.populate("company", "name slug logo industry");
    res.status(201).json({ success: true, message: "Review submitted successfully!", data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── GET /api/experiences/company/:id ──────────────────────
exports.getCompanyExperiences = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, type, sort = "-createdAt", page = 1, limit = 10 } = req.query;

    const filter = { company: id, isApproved: true };
    if (role) filter.role = { $regex: role, $options: "i" };
    if (type) filter.employmentType = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [experiences, total] = await Promise.all([
      EmployeeExperience.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).populate("company", "name slug"),
      EmployeeExperience.countDocuments(filter),
    ]);

    // Distinct roles for filter UI
    const roles = await EmployeeExperience.distinct("role", { company: id, isApproved: true });

    res.json({
      success: true,
      count: experiences.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      roles,
      data: experiences,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/experiences/:id ───────────────────────────────
exports.getExperience = async (req, res) => {
  try {
    const exp = await EmployeeExperience.findById(req.params.id).populate("company", "name slug logo");
    if (!exp) return res.status(404).json({ success: false, message: "Review not found." });
    res.json({ success: true, data: exp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/experiences/:id ───────────────────────────
exports.deleteExperience = async (req, res) => {
  try {
    const exp = await EmployeeExperience.findById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: "Review not found." });

    // Only owner or admin can delete
    if (exp.user?.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Not authorised to delete this review." });

    await EmployeeExperience.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Review deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/experiences/:id/upvote ──────────────────────
exports.upvoteExperience = async (req, res) => {
  try {
    const exp = await EmployeeExperience.findById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: "Review not found." });

    const userId = req.user?._id?.toString();
    const alreadyUpvoted = userId && exp.upvotedBy.map(String).includes(userId);

    if (alreadyUpvoted) {
      exp.upvotes = Math.max(0, exp.upvotes - 1);
      exp.upvotedBy = exp.upvotedBy.filter((id) => id.toString() !== userId);
    } else {
      exp.upvotes += 1;
      if (userId) exp.upvotedBy.push(req.user._id);
    }
    await exp.save();
    res.json({ success: true, upvotes: exp.upvotes, upvoted: !alreadyUpvoted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/experiences/:id/report ─────────────────────
exports.reportExperience = async (req, res) => {
  try {
    const exp = await EmployeeExperience.findById(req.params.id);
    if (!exp) return res.status(404).json({ success: false, message: "Review not found." });

    exp.isReported = true;
    if (req.user?._id) exp.reportedBy.push(req.user._id);
    await exp.save();

    res.json({ success: true, message: "Review reported. We will investigate shortly." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
