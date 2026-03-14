const express = require("express");
const router = express.Router();
const { getSuggestions, search } = require("../controllers/searchController");

// GET  /api/search/suggest?q=react
router.get("/suggest", getSuggestions);

// GET  /api/search?q=developer&type=jobs
router.get("/", search);

module.exports = router;
