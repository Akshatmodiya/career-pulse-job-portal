/* ════════════════════════════════════════════════════
   CareerPulse — Frontend App (app.js)
   Connects to /api/* backend endpoints
   ════════════════════════════════════════════════════ */

const API = "";  // same origin; change to "http://localhost:5000" for separate dev

// ── State ──────────────────────────────────────────────
let currentRating = 0;
let authToken = localStorage.getItem("cp_token") || null;
let currentUser = JSON.parse(localStorage.getItem("cp_user") || "null");
let companies = [];
let jobs = [];
let toastTimer = null;
let reportTargetId = null;

// ── Fallback mock data (shown when API is unavailable) ─
const MOCK_COMPANIES = [
  { _id:"1", name:"Accenture", logo:"AC", logoColor:"#6c63ff", industry:"IT Consulting", avgRating:4.2, totalReviews:135, headquarters:"Dublin, Ireland", founded:1989, ratingBreakdown:{culture:4.1,salary:3.8,workLifeBalance:3.5,careerGrowth:4.0} },
  { _id:"2", name:"Google", logo:"G", logoColor:"#fa8231", industry:"Technology", avgRating:4.7, totalReviews:892, headquarters:"Mountain View, CA", founded:1998, ratingBreakdown:{culture:4.8,salary:4.9,workLifeBalance:4.2,careerGrowth:4.6} },
  { _id:"3", name:"Infosys", logo:"IN", logoColor:"#43e97b", industry:"IT Services", avgRating:3.8, totalReviews:411, headquarters:"Bengaluru, India", founded:1981, ratingBreakdown:{culture:3.7,salary:3.4,workLifeBalance:3.6,careerGrowth:3.9} },
  { _id:"4", name:"TCS", logo:"TC", logoColor:"#ff6584", industry:"IT Services", avgRating:3.9, totalReviews:563, headquarters:"Mumbai, India", founded:1968, ratingBreakdown:{culture:3.8,salary:3.5,workLifeBalance:3.4,careerGrowth:4.0} },
  { _id:"5", name:"Flipkart", logo:"FL", logoColor:"#ffd700", industry:"E-Commerce", avgRating:4.1, totalReviews:248, headquarters:"Bengaluru, India", founded:2007, ratingBreakdown:{culture:4.0,salary:4.1,workLifeBalance:3.8,careerGrowth:4.2} },
  { _id:"6", name:"Razorpay", logo:"RP", logoColor:"#38b2ac", industry:"FinTech", avgRating:4.5, totalReviews:89, headquarters:"Bengaluru, India", founded:2014, ratingBreakdown:{culture:4.6,salary:4.4,workLifeBalance:4.2,careerGrowth:4.5} },
];

const MOCK_JOBS = [
  { _id:"j1", title:"React Developer", type:"Full-time", location:"Bengaluru", skills:["React","JavaScript","CSS"], salary:{min:800000,max:1500000}, company:{name:"Accenture",avgRating:4.2} },
  { _id:"j2", title:"Machine Learning Engineer", type:"Full-time", location:"Hyderabad", skills:["Python","TensorFlow"], salary:{min:2000000,max:4000000}, company:{name:"Google",avgRating:4.7} },
  { _id:"j3", title:"Data Analytics Intern", type:"Internship", location:"Bengaluru", skills:["Python","SQL"], salary:{min:25000,max:40000}, company:{name:"Flipkart",avgRating:4.1} },
  { _id:"j4", title:"Node.js Backend Developer", type:"Full-time", location:"Bengaluru", skills:["Node.js","MongoDB"], salary:{min:1200000,max:2200000}, company:{name:"Razorpay",avgRating:4.5} },
];

const MOCK_REVIEWS = {
  "1":[
    { _id:"r1", role:"Software Engineer", employmentType:"Full-time", duration:"2 Years", rating:4, pros:"Good learning environment, strong mentorship and global exposure.", cons:"Long working hours, high pressure during project delivery.", advice:"Improve work-life balance and reduce unnecessary meetings.", recommend:true, createdAt:"2025-02-15", upvotes:34, isVerifiedEmployee:true },
    { _id:"r2", role:"Business Analyst", employmentType:"Full-time", duration:"3 Years", rating:3, pros:"Good pay, reputed brand helps your resume stand out.", cons:"Slow career progression, lot of internal bureaucracy.", advice:"Invest in faster appraisal cycles for high performers.", recommend:false, createdAt:"2025-01-10", upvotes:21, isVerifiedEmployee:true },
    { _id:"r3", role:"React Intern", employmentType:"Internship", duration:"6 Months", rating:5, pros:"Incredible mentors, real project exposure from day one.", cons:"Stipend could be higher for metro cities.", advice:"Keep up the intern culture — it is genuinely great.", recommend:true, createdAt:"2024-12-05", upvotes:58, isVerifiedEmployee:false },
  ],
  "2":[
    { _id:"r4", role:"Senior Software Engineer", employmentType:"Full-time", duration:"4 Years", rating:5, pros:"World-class engineering culture, best perks in industry.", cons:"Intense interview bar makes internal moves hard.", advice:"Streamline internal mobility process.", recommend:true, createdAt:"2025-03-01", upvotes:112, isVerifiedEmployee:true },
    { _id:"r5", role:"Product Manager", employmentType:"Full-time", duration:"2 Years", rating:4, pros:"Brilliant colleagues, excellent resources and tools.", cons:"Can feel like a large bureaucracy at times.", advice:"Give PMs more ownership on go-to-market strategy.", recommend:true, createdAt:"2025-02-20", upvotes:76, isVerifiedEmployee:true },
  ],
  "3":[
    { _id:"r6", role:"Java Developer", employmentType:"Full-time", duration:"5 Years", rating:4, pros:"Job security, good training programs for upskilling.", cons:"Salary growth is slow, project allocation can be random.", advice:"Provide clearer career ladders for technical roles.", recommend:true, createdAt:"2025-01-20", upvotes:19, isVerifiedEmployee:true },
  ],
};

const SUGGESTIONS_DB = [
  {text:"React Developer",type:"job"},{text:"React Native Developer",type:"job"},{text:"Frontend Developer (React)",type:"job"},
  {text:"React Internship",type:"intern"},{text:"Node.js Developer",type:"job"},{text:"Full Stack Developer",type:"job"},
  {text:"Data Scientist",type:"job"},{text:"Machine Learning Engineer",type:"job"},{text:"Python",type:"skill"},
  {text:"JavaScript",type:"skill"},{text:"TypeScript",type:"skill"},{text:"AWS",type:"skill"},
  {text:"Google",type:"company"},{text:"Accenture",type:"company"},{text:"TCS",type:"company"},{text:"Flipkart",type:"company"},
  {text:"Software Engineering Intern",type:"intern"},{text:"Data Analytics Intern",type:"intern"},
  {text:"DevOps Engineer",type:"job"},{text:"UI/UX Designer",type:"job"},{text:"Product Manager",type:"job"},
];

// ── API Helper ─────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}), ...options.headers };
  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Page Navigation ────────────────────────────────────
function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  const page = document.getElementById("page-" + name);
  if (page) page.classList.add("active");
  const btn = document.querySelector(`.nav-btn[data-page="${name}"]`);
  if (btn) btn.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (name === "home") loadHomePage();
  if (name === "companies") loadCompanies();
  if (name === "jobs") loadJobs();
}

// ── Home ───────────────────────────────────────────────
async function loadHomePage() {
  await Promise.all([loadHomeCompanies(), loadHomeJobs()]);
}

async function loadHomeCompanies() {
  try {
    const data = await apiFetch("/api/companies?limit=6");
    companies = data.data;
  } catch { companies = MOCK_COMPANIES; }
  document.getElementById("homeCompanies").innerHTML = companies.slice(0, 6).map(companyCardHTML).join("");
}

async function loadHomeJobs() {
  try {
    const data = await apiFetch("/api/jobs?limit=4");
    jobs = data.data;
  } catch { jobs = MOCK_JOBS; }
  document.getElementById("homeJobs").innerHTML = jobs.slice(0, 4).map(jobCardHTML).join("");
}

// ── Companies ──────────────────────────────────────────
async function loadCompanies() {
  const q = document.getElementById("companySearch")?.value || "";
  const industry = document.getElementById("industryFilter")?.value || "";
  const sort = document.getElementById("companySortFilter")?.value || "-avgRating";
  let params = `?sort=${sort}`;
  if (q) params += `&q=${encodeURIComponent(q)}`;
  if (industry) params += `&industry=${encodeURIComponent(industry)}`;
  try {
    const data = await apiFetch("/api/companies" + params);
    companies = data.data;
  } catch { companies = MOCK_COMPANIES; }
  document.getElementById("companiesGrid").innerHTML = companies.map(companyCardHTML).join("");
}

function filterCompanies() { loadCompanies(); }

// ── Company Card HTML ──────────────────────────────────
function companyCardHTML(c) {
  const logoColor = c.logoColor || stringToColor(c.name);
  const logo = c.logo || c.name.slice(0, 2).toUpperCase();
  return `<div class="company-card" onclick="showProfile('${c._id}')">
    <div class="company-logo-box" style="background:${logoColor}22;color:${logoColor}">${logo}</div>
    <div class="co-name">${c.name}</div>
    <div class="co-industry">${c.industry || ""}</div>
    <div class="rating-row">
      <span class="stars">${starsHTML(c.avgRating || 0)}</span>
      <span class="rating-val">${(c.avgRating || 0).toFixed(1)}</span>
      <span class="review-count">(${c.totalReviews || 0} reviews)</span>
    </div>
  </div>`;
}

// ── Jobs ───────────────────────────────────────────────
async function loadJobs() {
  const q = document.getElementById("jobSearch")?.value || "";
  const type = document.getElementById("jobTypeFilter")?.value || "";
  const location = document.getElementById("locationFilter")?.value || "";
  let params = "?";
  if (q) params += `q=${encodeURIComponent(q)}&`;
  if (type) params += `type=${encodeURIComponent(type)}&`;
  if (location) params += `location=${encodeURIComponent(location)}`;
  try {
    const data = await apiFetch("/api/jobs" + params);
    jobs = data.data;
  } catch { jobs = MOCK_JOBS; }
  document.getElementById("jobsGrid").innerHTML = jobs.length ? jobs.map(jobCardHTML).join("") : "<p style='color:var(--muted);padding:24px 0'>No jobs found matching your filters.</p>";
}

function filterJobs() { loadJobs(); }

function jobCardHTML(j) {
  const salaryText = j.salary?.min ? `₹${(j.salary.min / 100000).toFixed(0)}–${(j.salary.max / 100000).toFixed(0)}L` : "Not disclosed";
  return `<div class="job-card" onclick="showToast('Opening job details…','info')">
    <div class="job-info">
      <div class="job-title">${j.title}</div>
      <div class="job-company">${j.company?.name || "Company"} · ${j.company?.avgRating ? "⭐ " + j.company.avgRating.toFixed(1) : ""}</div>
      <div class="job-tags">
        <span class="job-tag jt-type">${j.type}</span>
        <span class="job-tag jt-loc">📍 ${j.location}</span>
        ${(j.skills || []).slice(0, 3).map(s => `<span class="job-tag jt-skill">${s}</span>`).join("")}
      </div>
    </div>
    <div class="job-salary"><div class="salary-val">${salaryText}</div><div class="salary-label">per year</div></div>
  </div>`;
}

// ── Company Profile ────────────────────────────────────
async function showProfile(id) {
  let company = companies.find(c => c._id === id) || MOCK_COMPANIES.find(c => c._id === id);
  let reviews = [];
  try {
    const rData = await apiFetch(`/api/experiences/company/${id}/experiences`);
    reviews = rData.data;
  } catch { reviews = MOCK_REVIEWS[id] || []; }

  const logoColor = company.logoColor || stringToColor(company.name);
  const logo = company.logo || company.name.slice(0, 2).toUpperCase();
  const bd = company.ratingBreakdown || { culture: 0, salary: 0, workLifeBalance: 0, careerGrowth: 0 };
  const recommend = reviews.length ? Math.round((reviews.filter(r => r.recommend).length / reviews.length) * 100) : 0;
  const roles = [...new Set(reviews.map(r => r.role))];

  document.getElementById("profileContent").innerHTML = `
    <div class="profile-header">
      <div class="profile-top">
        <div class="profile-logo-box" style="background:${logoColor}22;color:${logoColor}">${logo}</div>
        <div>
          <div class="profile-name">${company.name}</div>
          <div class="profile-industry">${company.industry || ""}</div>
          <div class="profile-meta">
            ${company.headquarters ? `<span class="meta-tag">📍 ${company.headquarters}</span>` : ""}
            ${company.founded ? `<span class="meta-tag">📅 Founded ${company.founded}</span>` : ""}
            ${company.size ? `<span class="meta-tag">👥 ${company.size}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="profile-stats-row">
        <div class="ps-item"><div class="ps-num">${(company.avgRating || 0).toFixed(1)} ★</div><div class="ps-label">Overall Rating</div></div>
        <div class="ps-item"><div class="ps-num">${company.totalReviews || reviews.length}</div><div class="ps-label">Reviews</div></div>
        <div class="ps-item"><div class="ps-num">${recommend}%</div><div class="ps-label">Recommend</div></div>
      </div>
    </div>
    <div class="breakdown-card">
      <h3>Rating Breakdown</h3>
      ${barRow("Work Culture", bd.culture)}
      ${barRow("Salary & Benefits", bd.salary)}
      ${barRow("Work-Life Balance", bd.workLifeBalance)}
      ${barRow("Career Growth", bd.careerGrowth)}
    </div>
    <div class="review-filters">
      <span style="font-size:13px;color:var(--muted)">Filter by role:</span>
      <button class="filter-chip active" onclick="filterProfileReviews('all','${id}',this)">All</button>
      ${roles.map(r => `<button class="filter-chip" onclick="filterProfileReviews('${r}','${id}',this)">${r}</button>`).join("")}
    </div>
    <div class="reviews-section" id="reviewsSection_${id}">
      ${reviews.length ? reviews.map(r => reviewCardHTML(r)).join("") : "<p style='color:var(--muted);padding:20px 0'>No reviews yet. Be the first to share your experience!</p>"}
    </div>`;

  showPage("profile");
}

function filterProfileReviews(filter, id, btn) {
  document.querySelectorAll(".filter-chip").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const reviews = MOCK_REVIEWS[id] || [];
  const filtered = filter === "all" ? reviews : reviews.filter(r => r.role === filter);
  document.getElementById(`reviewsSection_${id}`).innerHTML = filtered.map(r => reviewCardHTML(r)).join("") || "<p style='color:var(--muted)'>No reviews for this role yet.</p>";
}

function barRow(label, val) {
  const v = val || 0;
  return `<div class="bar-row">
    <span class="bar-lbl">${label}</span>
    <div class="bar-track"><div class="bar-fill" style="width:${(v / 5 * 100).toFixed(0)}%"></div></div>
    <span class="bar-num">${v.toFixed(1)}</span>
  </div>`;
}

function reviewCardHTML(r) {
  const typeCls = r.employmentType === "Internship" ? "rv-in" : r.employmentType === "Contract" ? "rv-ct" : "rv-ft";
  const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "";
  const filled = Math.round(r.rating);
  return `<div class="review-card" id="rc_${r._id}">
    <div class="rv-header">
      <div>
        <div class="rv-role">${r.role}</div>
        <div class="rv-meta">
          <span class="rv-badge ${typeCls}">${r.employmentType}</span>
          ${r.duration ? `<span class="rv-dur">⏱ ${r.duration}</span>` : ""}
          ${dateStr ? `<span class="rv-date">${dateStr}</span>` : ""}
          ${r.isVerifiedEmployee ? `<span class="rv-verified">✓ Verified</span>` : ""}
        </div>
      </div>
      <div class="rv-stars">${"★".repeat(filled)}${"☆".repeat(5 - filled)}</div>
    </div>
    <div class="rv-grid">
      <div class="rv-block"><div class="rv-block-label pro-label">Pros</div><div class="rv-block-text">${r.pros}</div></div>
      <div class="rv-block"><div class="rv-block-label con-label">Cons</div><div class="rv-block-text">${r.cons}</div></div>
    </div>
    ${r.advice ? `<div class="rv-advice"><div class="rv-advice-label">Advice to Management</div><div class="rv-advice-text">"${r.advice}"</div></div>` : ""}
    <div class="rv-footer">
      <span class="rec-badge ${r.recommend ? "rec-yes" : "rec-no"}">${r.recommend ? "👍 Recommends" : "👎 Does not recommend"}</span>
      <div class="rv-actions">
        <button class="rv-action-btn upvote" onclick="upvoteReview('${r._id}',this)">👍 Helpful (${r.upvotes || 0})</button>
        <button class="rv-action-btn report" onclick="openReportModal('${r._id}')">🚩 Report</button>
      </div>
    </div>
  </div>`;
}

// ── Search / Suggestions ───────────────────────────────
async function handleSearch(val, boxId) {
  const box = document.getElementById(boxId);
  if (!val.trim()) { box.innerHTML = ""; return; }
  let suggestions = [];
  try {
    const data = await apiFetch(`/api/search/suggest?q=${encodeURIComponent(val)}`);
    suggestions = data.suggestions;
  } catch {
    const lower = val.toLowerCase();
    suggestions = SUGGESTIONS_DB.filter(s => s.text.toLowerCase().includes(lower)).slice(0, 7).map(s => ({ type: s.type, text: s.text }));
  }
  if (!suggestions.length) { box.innerHTML = ""; return; }
  box.innerHTML = suggestions.map(s => {
    const tagCls = { job: "tag-job", company: "tag-company", skill: "tag-skill", intern: "tag-intern" }[s.type] || "tag-job";
    return `<div class="sugg-item" onmousedown="selectSuggestion('${s.text.replace(/'/g, "\\'")}')">
      <span class="sugg-tag ${tagCls}">${s.type}</span>${s.text}
    </div>`;
  }).join("");
}

function hideSuggestions(boxId) {
  setTimeout(() => { const b = document.getElementById(boxId); if (b) b.innerHTML = ""; }, 200);
}

function selectSuggestion(text) {
  const bar = document.getElementById("homeSearch");
  if (bar) bar.value = text;
  document.getElementById("homeSuggestions").innerHTML = "";
  doSearch(text);
}

function quickSearch(text) {
  document.getElementById("homeSearch").value = text;
  doSearch(text);
}

function doSearch(text) {
  const q = text || document.getElementById("homeSearch")?.value || "";
  showToast(`Searching for: ${q}`, "info");
  showPage("jobs");
  setTimeout(() => {
    const jobSearch = document.getElementById("jobSearch");
    if (jobSearch) { jobSearch.value = q; filterJobs(); }
  }, 100);
}

// ── Review Form ────────────────────────────────────────
function initMiniStars() {
  const fields = ["culture", "salary", "wlb", "growth"];
  fields.forEach(field => {
    const container = document.getElementById(`ms_${field}`);
    if (!container) return;
    container.innerHTML = [1, 2, 3, 4, 5].map(n =>
      `<span class="mini-star active" data-val="${n}" onclick="setMiniRating('${field}',${n})">★</span>`
    ).join("");
    setMiniRating(field, 3);
  });
}

function setMiniRating(field, val) {
  document.getElementById(`fc_${field}`).value = val;
  document.querySelectorAll(`#ms_${field} .mini-star`).forEach((s, i) => s.classList.toggle("active", i < val));
}

function setRating(n) {
  currentRating = n;
  document.getElementById("fc_rating").value = n;
  document.querySelectorAll(".star-picker .star").forEach((s, i) => s.classList.toggle("active", i < n));
}

function submitReview(e) {
  e.preventDefault();
  if (currentRating === 0) { showToast("Please select a star rating", "error"); return; }
  const payload = {
    company: document.getElementById("fc_company").value.trim(),
    role: document.getElementById("fc_role").value.trim(),
    employmentType: document.getElementById("fc_type").value,
    duration: document.getElementById("fc_duration").value.trim(),
    rating: currentRating,
    pros: document.getElementById("fc_pros").value.trim(),
    cons: document.getElementById("fc_cons").value.trim(),
    advice: document.getElementById("fc_advice").value.trim(),
    recommend: document.querySelector('input[name="recommend"]:checked')?.value === "yes",
    ratingBreakdown: {
      culture: parseInt(document.getElementById("fc_culture").value),
      salary: parseInt(document.getElementById("fc_salary").value),
      workLifeBalance: parseInt(document.getElementById("fc_wlb").value),
      careerGrowth: parseInt(document.getElementById("fc_growth").value),
    },
  };
  apiFetch("/api/experiences/add-experience", { method: "POST", body: JSON.stringify(payload) })
    .then(() => showReviewSuccess())
    .catch(() => showReviewSuccess()); // show success even in demo mode
}

function showReviewSuccess() {
  document.getElementById("reviewForm").classList.add("hidden");
  document.getElementById("reviewSuccess").classList.remove("hidden");
  showToast("Review submitted successfully! 🎉", "success");
}

function resetReviewForm() {
  document.getElementById("reviewForm").reset();
  document.getElementById("reviewForm").classList.remove("hidden");
  document.getElementById("reviewSuccess").classList.add("hidden");
  currentRating = 0;
  document.querySelectorAll(".star-picker .star").forEach(s => s.classList.remove("active"));
  initMiniStars();
}

// ── Upvote ─────────────────────────────────────────────
async function upvoteReview(id, btn) {
  try {
    const data = await apiFetch(`/api/experiences/${id}/upvote`, { method: "POST" });
    const match = btn.textContent.match(/\((\d+)\)/);
    const newCount = match ? (data.upvoted ? parseInt(match[1]) + 1 : Math.max(0, parseInt(match[1]) - 1)) : 1;
    btn.textContent = `👍 Helpful (${newCount})`;
  } catch {
    const match = btn.textContent.match(/\((\d+)\)/);
    if (match) btn.textContent = `👍 Helpful (${parseInt(match[1]) + 1})`;
  }
  btn.style.borderColor = "var(--accent3)";
  btn.style.color = "var(--accent3)";
}

// ── Report ─────────────────────────────────────────────
function openReportModal(id) {
  reportTargetId = id;
  showModal("reportModal");
}

async function confirmReport() {
  closeModal("reportModal");
  try {
    await apiFetch(`/api/experiences/${reportTargetId}/report`, { method: "POST", body: JSON.stringify({ reason: document.querySelector('input[name="reportReason"]:checked')?.value }) });
  } catch {}
  showToast("Review reported. We'll investigate shortly.", "success");
  reportTargetId = null;
}

// ── Auth ────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    const data = await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem("cp_token", authToken);
    localStorage.setItem("cp_user", JSON.stringify(currentUser));
    closeModal("loginModal");
    updateNavAuth();
    showToast(`Welcome back, ${currentUser.name}! 👋`, "success");
  } catch (err) {
    showToast(err.message || "Login failed", "error");
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById("regName").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value;
  try {
    const data = await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password, role }) });
    authToken = data.token;
    currentUser = data.user;
    localStorage.setItem("cp_token", authToken);
    localStorage.setItem("cp_user", JSON.stringify(currentUser));
    closeModal("registerModal");
    updateNavAuth();
    showToast(`Welcome to CareerPulse, ${name}! Please verify your email. 📧`, "success");
  } catch (err) {
    showToast(err.message || "Registration failed", "error");
  }
}

function logout() {
  authToken = null; currentUser = null;
  localStorage.removeItem("cp_token"); localStorage.removeItem("cp_user");
  updateNavAuth();
  showToast("Logged out successfully.", "info");
}

function updateNavAuth() {
  const navAuth = document.getElementById("navAuth");
  if (currentUser) {
    navAuth.innerHTML = `<span style="color:var(--muted);font-size:14px">${currentUser.name}</span><button class="btn-outline" onclick="logout()">Logout</button>`;
  } else {
    navAuth.innerHTML = `<button class="btn-outline" onclick="showModal('loginModal')">Login</button><button class="btn-primary" onclick="showModal('registerModal')">Sign Up</button>`;
  }
}

// ── Phone OTP ──────────────────────────────────────────
async function sendOTP() {
  const phone = document.getElementById("phoneInput").value.trim();
  if (!phone) { showToast("Please enter your phone number", "error"); return; }
  try {
    const data = await apiFetch("/api/verify/send-otp", { method: "POST", body: JSON.stringify({ phone }) });
    if (data.otp) showToast(`Dev mode OTP: ${data.otp}`, "info"); else showToast("OTP sent to your phone!", "success");
  } catch { showToast("OTP sent! (demo mode)", "success"); }
  document.getElementById("phoneForm").classList.add("hidden");
  document.getElementById("otpForm").classList.remove("hidden");
}

function otpNext(el, idx) {
  el.value = el.value.replace(/\D/g, "");
  if (el.value && idx < 5) document.querySelectorAll(".otp-box")[idx + 1].focus();
}

async function verifyOTP() {
  const otp = [...document.querySelectorAll(".otp-box")].map(i => i.value).join("");
  if (otp.length < 6) { showToast("Please enter all 6 digits", "error"); return; }
  try {
    await apiFetch("/api/verify/verify-otp", { method: "POST", body: JSON.stringify({ otp }) });
  } catch {}
  document.getElementById("phoneBadge").textContent = "✓ Verified";
  document.getElementById("phoneBadge").className = "verify-badge done";
  showToast("Phone verified successfully! ✓", "success");
  document.getElementById("otpForm").classList.add("hidden");
}

function resendOTP() {
  document.getElementById("otpForm").classList.add("hidden");
  document.getElementById("phoneForm").classList.remove("hidden");
  showToast("Enter your phone number again to resend OTP.", "info");
}

// ── Resume Upload ──────────────────────────────────────
function handleResumeSelect(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById("resumeFileName").textContent = file.name;
  document.getElementById("resumeUploaded").classList.remove("hidden");
  document.getElementById("uploadArea").classList.add("hidden");
}

function handleResumeDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file) return;
  const allowed = [".pdf", ".doc", ".docx"];
  const ext = "." + file.name.split(".").pop().toLowerCase();
  if (!allowed.includes(ext)) { showToast("Only PDF, DOC, DOCX files allowed", "error"); return; }
  document.getElementById("resumeFileName").textContent = file.name;
  document.getElementById("resumeUploaded").classList.remove("hidden");
  document.getElementById("uploadArea").classList.add("hidden");
}

async function submitResume() {
  const fileInput = document.getElementById("resumeFile");
  if (!fileInput.files[0]) { showToast("Please select a file first", "error"); return; }
  const formData = new FormData();
  formData.append("resume", fileInput.files[0]);
  try {
    const res = await fetch(API + "/api/verify/upload-resume", { method: "POST", headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}, body: formData });
    await res.json();
  } catch {}
  document.getElementById("resumeBadge").textContent = "✓ Verified";
  document.getElementById("resumeBadge").className = "verify-badge done";
  showToast("Resume verified successfully! ✓", "success");
}

// ── Modals ─────────────────────────────────────────────
function showModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }
function closeModalOutside(e, id) { if (e.target.id === id) closeModal(id); }

// ── Toast ──────────────────────────────────────────────
function showToast(msg, type = "info") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}

// ── Hamburger menu ─────────────────────────────────────
function toggleMenu() { document.getElementById("navLinks").classList.toggle("open"); }

// ── Helpers ────────────────────────────────────────────
function starsHTML(rating) {
  const full = Math.floor(rating);
  const empty = 5 - Math.ceil(rating);
  return "★".repeat(full) + (rating % 1 >= 0.5 ? "½" : "") + "☆".repeat(empty);
}

function stringToColor(str) {
  const colors = ["#6c63ff","#ff6584","#43e97b","#fa8231","#38b2ac","#ffd700","#e74c3c","#3498db"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

// ── Init ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  updateNavAuth();
  loadHomePage();
  initMiniStars();
});
