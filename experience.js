const express = require("express");
const router = express.Router();
const {
  addExperience,
  getCompanyExperiences,
  getExperience,
  deleteExperience,
  upvoteExperience,
  reportExperience,
} = require("../controllers/experienceController");
const { protect, optionalAuth } = require("../middleware/auth");

// POST   /api/experiences/add-experience
router.post("/add-experience", optionalAuth, addExperience);

// GET    /api/experiences/company/:id  — all reviews for a company
router.get("/company/:id/experiences", getCompanyExperiences);

// GET    /api/experiences/:id  — single review
router.get("/:id", getExperience);

// DELETE /api/experiences/:id
router.delete("/:id", protect, deleteExperience);

// POST   /api/experiences/:id/upvote
router.post("/:id/upvote", optionalAuth, upvoteExperience);

// POST   /api/experiences/:id/report
router.post("/:id/report", optionalAuth, reportExperience);

module.exports = router;
