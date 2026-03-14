const express = require("express");
const router = express.Router();
const {
  sendPhoneOTP,
  verifyPhoneOTP,
  uploadResume,
  handleResumeUpload,
  getVerificationStatus,
} = require("../controllers/verifyController");
const { protect } = require("../middleware/auth");

// All verification routes require login
router.use(protect);

// GET  /api/verify/status
router.get("/status", getVerificationStatus);

// POST /api/verify/send-otp
router.post("/send-otp", sendPhoneOTP);

// POST /api/verify/verify-otp
router.post("/verify-otp", verifyPhoneOTP);

// POST /api/verify/upload-resume  (multipart/form-data, field: resume)
router.post("/upload-resume", (req, res, next) => {
  uploadResume(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, handleResumeUpload);

module.exports = router;
