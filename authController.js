const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ── Helper: sign JWT ───────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// ── Helper: send email ─────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

// ── POST /api/auth/register ────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Please provide name, email and password." });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: "Email already registered." });

    const emailToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({ name, email, password, "verification.emailToken": emailToken });

    // Send verification email (non-blocking)
    const verifyURL = `${process.env.CLIENT_URL || "http://localhost:5000"}/api/auth/verify-email/${emailToken}`;
    try {
      await sendEmail({
        to: email,
        subject: "Verify your CareerPulse account",
        html: `<h2>Welcome to CareerPulse, ${name}!</h2><p>Click the link below to activate your account:</p><a href="${verifyURL}" style="background:#6c63ff;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">Verify Email</a><p>This link expires in 24 hours.</p>`,
      });
    } catch (_) {
      console.warn("Email send failed — continuing without it.");
    }

    const token = signToken(user._id);
    res.status(201).json({
      success: true,
      message: "Registered successfully. Please verify your email.",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/login ───────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Please provide email and password." });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: "Account suspended. Contact support." });

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, verification: user.verification },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/verify-email/:token ─────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ "verification.emailToken": req.params.token });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired verification link." });

    user.verification.emailVerified = true;
    user.verification.emailToken = null;
    user.isVerified = true;
    await user.save();

    res.json({ success: true, message: "Email verified successfully! You can now log in." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
