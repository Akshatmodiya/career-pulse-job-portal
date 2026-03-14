const express = require("express");
const router = express.Router();
const {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/auth");

// GET    /api/jobs
router.get("/", getAllJobs);

// GET    /api/jobs/:id
router.get("/:id", getJob);

// POST   /api/jobs  (admin / employer)
router.post("/", protect, authorize("admin", "employer"), createJob);

// PUT    /api/jobs/:id
router.put("/:id", protect, authorize("admin", "employer"), updateJob);

// DELETE /api/jobs/:id
router.delete("/:id", protect, authorize("admin", "employer"), deleteJob);

module.exports = router;
