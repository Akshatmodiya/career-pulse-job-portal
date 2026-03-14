const User = require("../models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ── Multer — resume upload ─────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../../uploads/resumes");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `resume_${req.user._id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Only PDF, DOC, and DOCX files are allowed"), false);
};

exports.uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
}).single("resume");

// ── POST /api/verify/send-otp ─────────────────────────────
exports.sendPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: "Phone number is required." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.findByIdAndUpdate(req.user._id, {
      phone,
      "verification.phoneOTP": otp,
      "verification.phoneOTPExpiry": expiry,
    });

    // In production: integrate SMS provider (Twilio / MSG91 / Fast2SMS)
    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.json({ success: true, message: `OTP sent to ${phone}.`, ...(process.env.NODE_ENV === "development" && { otp }) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/verify/verify-otp ──────────────────────────
exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ success: false, message: "OTP is required." });

    const user = await User.findById(req.user._id);
    if (!user.verification.phoneOTP || user.verification.phoneOTP !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP." });

    if (new Date() > user.verification.phoneOTPExpiry)
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });

    user.verification.phoneVerified = true;
    user.verification.phoneOTP = null;
    user.verification.phoneOTPExpiry = null;
    await user.save();

    res.json({ success: true, message: "Phone number verified successfully! ✓" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/verify/upload-resume ───────────────────────
exports.handleResumeUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "Please upload a resume file." });

    // Basic resume "verification" — check file is parseable PDF/DOC
    await User.findByIdAndUpdate(req.user._id, {
      resume: req.file.filename,
      "verification.resumeVerified": true,
    });

    res.json({ success: true, message: "Resume uploaded and verified! ✓", file: req.file.filename });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/verify/status ────────────────────────────────
exports.getVerificationStatus = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({
    success: true,
    verification: {
      email: user.verification.emailVerified,
      phone: user.verification.phoneVerified,
      resume: user.verification.resumeVerified,
    },
    isFullyVerified: user.verification.emailVerified && user.verification.phoneVerified,
  });
};
