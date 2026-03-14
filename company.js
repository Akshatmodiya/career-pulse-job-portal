const express = require("express");
const router = express.Router();
const {
  getAllCompanies,
  getCompany,
  getCompanyBySlug,
  createCompany,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");
const { protect, authorize } = require("../middleware/auth");

// GET    /api/companies
router.get("/", getAllCompanies);

// GET    /api/companies/slug/:slug
router.get("/slug/:slug", getCompanyBySlug);

// GET    /api/companies/:id
router.get("/:id", getCompany);

// POST   /api/companies  (admin only)
router.post("/", protect, authorize("admin"), createCompany);

// PUT    /api/companies/:id  (admin only)
router.put("/:id", protect, authorize("admin"), updateCompany);

// DELETE /api/companies/:id  (admin only)
router.delete("/:id", protect, authorize("admin"), deleteCompany);

module.exports = router;
