const Company = require("../models/Company");
const Job = require("../models/Job");
const EmployeeExperience = require("../models/EmployeeExperience");

// ── GET /api/search/suggest?q= ────────────────────────────
// Returns auto-suggestions: job titles, skills, companies, internships
exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1)
      return res.json({ success: true, suggestions: [] });

    const regex = { $regex: q, $options: "i" };

    const [companies, jobs, roles] = await Promise.all([
      Company.find({ name: regex }).select("name industry").limit(4),
      Job.find({ $or: [{ title: regex }, { skills: regex }] }).select("title type skills").limit(6),
      EmployeeExperience.distinct("role", { role: regex }),
    ]);

    const suggestions = [];

    // Company suggestions
    companies.forEach((c) =>
      suggestions.push({ type: "company", text: c.name, sub: c.industry, id: c._id })
    );

    // Job title suggestions
    const seen = new Set();
    jobs.forEach((j) => {
      if (!seen.has(j.title)) {
        seen.add(j.title);
        suggestions.push({ type: j.type === "Internship" ? "intern" : "job", text: j.title, id: j._id });
      }
    });

    // Skill suggestions from job listings
    jobs.forEach((j) =>
      j.skills?.forEach((skill) => {
        if (skill.toLowerCase().includes(q.toLowerCase()) && !seen.has(skill)) {
          seen.add(skill);
          suggestions.push({ type: "skill", text: skill });
        }
      })
    );

    // Role suggestions from reviews
    roles.slice(0, 4).forEach((role) => {
      if (!seen.has(role)) {
        seen.add(role);
        suggestions.push({ type: "job", text: role });
      }
    });

    res.json({ success: true, suggestions: suggestions.slice(0, 8) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/search?q= ────────────────────────────────────
// Full search across jobs and companies
exports.search = async (req, res) => {
  try {
    const { q, type, page = 1, limit = 10 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Query is required." });

    const regex = { $regex: q, $options: "i" };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let results = { jobs: [], companies: [] };

    if (!type || type === "jobs") {
      results.jobs = await Job.find({
        isActive: true,
        $or: [{ title: regex }, { skills: regex }, { location: regex }],
      }).populate("company", "name logo avgRating industry").skip(skip).limit(parseInt(limit));
    }

    if (!type || type === "companies") {
      results.companies = await Company.find({ $or: [{ name: regex }, { industry: regex }] })
        .skip(skip).limit(parseInt(limit));
    }

    res.json({ success: true, query: q, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
