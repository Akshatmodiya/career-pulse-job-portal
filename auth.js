const express = require("express");
const router = express.Router();
const { register, login, verifyEmail, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// POST   /api/auth/register
router.post("/register", register);

// POST   /api/auth/login
router.post("/login", login);

// GET    /api/auth/verify-email/:token
router.get("/verify-email/:token", verifyEmail);

// GET    /api/auth/me  (protected)
router.get("/me", protect, getMe);

module.exports = router;
