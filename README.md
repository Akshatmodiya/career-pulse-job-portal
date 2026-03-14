# 🚀 CareerPulse — Job Portal

A full-stack job portal with company reviews, employee verification, auto-suggest search, and more.

---

## 📦 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Node.js, Express.js                 |
| Database | MongoDB + Mongoose                  |
| Auth     | JWT + bcryptjs                      |
| Email    | Nodemailer (Gmail / SMTP)           |
| Upload   | Multer (resume PDF/DOC)             |
| Frontend | Vanilla HTML + CSS + JavaScript     |

---

## 🗂️ Project Structure

```
careerpulse/
├── backend/
│   ├── server.js                  # Express entry point
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── seed.js                # Database seeder
│   ├── models/
│   │   ├── User.js                # User schema (auth + verification)
│   │   ├── Company.js             # Company schema
│   │   ├── EmployeeExperience.js  # Reviews schema
│   │   └── Job.js                 # Job listings schema
│   ├── controllers/
│   │   ├── authController.js      # Register, login, email verify
│   │   ├── companyController.js   # CRUD for companies
│   │   ├── experienceController.js# Add/get/delete reviews, upvote, report
│   │   ├── jobController.js       # CRUD for jobs
│   │   ├── searchController.js    # Auto-suggest + full search
│   │   └── verifyController.js    # Phone OTP + resume upload
│   ├── routes/
│   │   ├── auth.js
│   │   ├── company.js
│   │   ├── experience.js
│   │   ├── job.js
│   │   ├── search.js
│   │   └── verify.js
│   └── middleware/
│       └── auth.js                # JWT protect, optionalAuth, authorize
├── frontend/
│   └── public/
│       ├── index.html             # Single-page app
│       ├── css/style.css          # Full dark theme UI
│       └── js/app.js              # API-connected frontend logic
├── uploads/                       # Resume uploads (auto-created)
├── .env.example                   # Environment variable template
├── .gitignore
└── package.json
```

---

## ⚡ Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/careerpulse.git
cd careerpulse
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, and email credentials
```

### 3. Seed the Database (optional)

```bash
npm run seed
```

This inserts 6 companies, 6 reviews, and 4 job listings.

### 4. Start the Server

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Open **http://localhost:5000** in your browser.

---

## 🔌 API Reference

### Auth

| Method | Endpoint                         | Description              | Auth |
|--------|----------------------------------|--------------------------|------|
| POST   | `/api/auth/register`             | Register new user        | ✗    |
| POST   | `/api/auth/login`                | Login, returns JWT       | ✗    |
| GET    | `/api/auth/verify-email/:token`  | Activate email           | ✗    |
| GET    | `/api/auth/me`                   | Get current user         | ✓    |

### Companies

| Method | Endpoint                       | Description              | Auth  |
|--------|--------------------------------|--------------------------|-------|
| GET    | `/api/companies`               | List all companies       | ✗     |
| GET    | `/api/companies/:id`           | Get single company       | ✗     |
| GET    | `/api/companies/slug/:slug`    | Get company by slug      | ✗     |
| POST   | `/api/companies`               | Create company           | Admin |
| PUT    | `/api/companies/:id`           | Update company           | Admin |
| DELETE | `/api/companies/:id`           | Delete company           | Admin |

### Employee Experiences (Reviews)

| Method | Endpoint                                | Description              | Auth     |
|--------|-----------------------------------------|--------------------------|----------|
| POST   | `/api/experiences/add-experience`       | Submit a review          | Optional |
| GET    | `/api/experiences/company/:id/experiences` | Get company reviews  | ✗        |
| GET    | `/api/experiences/:id`                  | Get single review        | ✗        |
| DELETE | `/api/experiences/:id`                  | Delete review            | Owner    |
| POST   | `/api/experiences/:id/upvote`           | Upvote a review          | Optional |
| POST   | `/api/experiences/:id/report`           | Report fake review       | Optional |

**Query parameters for GET company reviews:**
- `?role=Engineer` — filter by role
- `?type=Full-time` — filter by employment type
- `?sort=-createdAt` — sort field
- `?page=1&limit=10` — pagination

### Jobs

| Method | Endpoint         | Description        | Auth     |
|--------|------------------|--------------------|----------|
| GET    | `/api/jobs`      | List jobs          | ✗        |
| GET    | `/api/jobs/:id`  | Get job details    | ✗        |
| POST   | `/api/jobs`      | Post a job         | Employer |
| PUT    | `/api/jobs/:id`  | Update job         | Employer |
| DELETE | `/api/jobs/:id`  | Delete job         | Employer |

### Search

| Method | Endpoint                     | Description                       |
|--------|------------------------------|-----------------------------------|
| GET    | `/api/search/suggest?q=`     | Auto-suggest (jobs, skills, companies) |
| GET    | `/api/search?q=&type=`       | Full search across jobs + companies   |

### Verification

| Method | Endpoint                        | Description              | Auth |
|--------|---------------------------------|--------------------------|------|
| GET    | `/api/verify/status`            | Get verification status  | ✓    |
| POST   | `/api/verify/send-otp`          | Send phone OTP           | ✓    |
| POST   | `/api/verify/verify-otp`        | Verify OTP               | ✓    |
| POST   | `/api/verify/upload-resume`     | Upload resume (multipart)| ✓    |

---

## 🔐 Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🌱 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/careerpulse
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=CareerPulse <noreply@careerpulse.com>
CLIENT_URL=http://localhost:3000
```

---

## ✨ Features

1. **Company Reviews** — employees share pros, cons, advice, salary insights, and star ratings
2. **Rating Breakdown** — work culture, salary, work-life balance, career growth
3. **Auto-Suggest Search** — real-time suggestions for jobs, skills, companies, and internships
4. **User Verification** — email activation, phone OTP, resume upload
5. **Upvote & Report** — community-driven review quality control
6. **Role-based Auth** — jobseeker, employer, admin roles
7. **Pagination & Filtering** — all list endpoints support filtering, sorting, and pagination

---

## 📝 License

MIT — free to use and modify.
