require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const Company = require("../models/Company");
const EmployeeExperience = require("../models/EmployeeExperience");
const Job = require("../models/Job");
const connectDB = require("./db");

const companies = [
  { name: "Accenture", slug: "accenture", industry: "IT Consulting", size: "100,000+", website: "https://accenture.com", logo: "AC", description: "Global professional services company.", headquarters: "Dublin, Ireland", founded: 1989 },
  { name: "Google", slug: "google", industry: "Technology", size: "100,000+", website: "https://google.com", logo: "G", description: "Multinational tech company specializing in internet-related services.", headquarters: "Mountain View, CA", founded: 1998 },
  { name: "Infosys", slug: "infosys", industry: "IT Services", size: "300,000+", website: "https://infosys.com", logo: "IN", description: "Global leader in next-generation digital services.", headquarters: "Bengaluru, India", founded: 1981 },
  { name: "TCS", slug: "tcs", industry: "IT Services", size: "600,000+", website: "https://tcs.com", logo: "TC", description: "Indian multinational IT services and consulting company.", headquarters: "Mumbai, India", founded: 1968 },
  { name: "Flipkart", slug: "flipkart", industry: "E-Commerce", size: "30,000+", website: "https://flipkart.com", logo: "FL", description: "India's leading e-commerce marketplace.", headquarters: "Bengaluru, India", founded: 2007 },
  { name: "Razorpay", slug: "razorpay", industry: "FinTech", size: "3,000+", website: "https://razorpay.com", logo: "RP", description: "India's leading full-stack financial solutions company.", headquarters: "Bengaluru, India", founded: 2014 },
];

const seedDB = async () => {
  await connectDB();
  console.log("🌱 Seeding database...");

  await Company.deleteMany();
  await EmployeeExperience.deleteMany();
  await Job.deleteMany();

  const createdCompanies = await Company.insertMany(companies);
  console.log(`✅ Inserted ${createdCompanies.length} companies`);

  const experiences = [
    { company: createdCompanies[0]._id, employeeName: "Anonymous", role: "Software Engineer", employmentType: "Full-time", duration: "2 Years", rating: 4, pros: "Good learning environment, strong mentorship program and global exposure.", cons: "Long working hours, high pressure deadlines especially during project delivery.", advice: "Improve work-life balance policies and reduce unnecessary meetings.", recommend: true, ratingBreakdown: { culture: 4, salary: 4, workLifeBalance: 3, careerGrowth: 4 } },
    { company: createdCompanies[0]._id, employeeName: "Anonymous", role: "Business Analyst", employmentType: "Full-time", duration: "3 Years", rating: 3, pros: "Good pay, reputed brand name helps your resume stand out.", cons: "Slow career progression and lot of internal bureaucracy.", advice: "Invest in faster appraisal cycles for high performers.", recommend: false, ratingBreakdown: { culture: 3, salary: 4, workLifeBalance: 3, careerGrowth: 3 } },
    { company: createdCompanies[0]._id, employeeName: "Anonymous", role: "React Intern", employmentType: "Internship", duration: "6 Months", rating: 5, pros: "Incredible mentors, real project exposure from day one.", cons: "Stipend could be higher for metro cities.", advice: "Keep up the intern culture — it is genuinely great.", recommend: true, ratingBreakdown: { culture: 5, salary: 3, workLifeBalance: 4, careerGrowth: 5 } },
    { company: createdCompanies[1]._id, employeeName: "Anonymous", role: "Senior Software Engineer", employmentType: "Full-time", duration: "4 Years", rating: 5, pros: "World-class engineering culture, best perks in the industry.", cons: "Intense interview bar makes internal moves hard.", advice: "Streamline the internal mobility process.", recommend: true, ratingBreakdown: { culture: 5, salary: 5, workLifeBalance: 4, careerGrowth: 5 } },
    { company: createdCompanies[1]._id, employeeName: "Anonymous", role: "Product Manager", employmentType: "Full-time", duration: "2 Years", rating: 4, pros: "Brilliant colleagues, excellent resources and tools at your disposal.", cons: "Can feel like a large bureaucracy at times.", advice: "Give PMs more ownership on go-to-market strategy.", recommend: true, ratingBreakdown: { culture: 5, salary: 5, workLifeBalance: 4, careerGrowth: 4 } },
    { company: createdCompanies[2]._id, employeeName: "Anonymous", role: "Java Developer", employmentType: "Full-time", duration: "5 Years", rating: 4, pros: "Job security, good training programs for upskilling.", cons: "Salary growth is slow, project allocation can be random.", advice: "Provide clearer career ladders for technical roles.", recommend: true, ratingBreakdown: { culture: 4, salary: 3, workLifeBalance: 4, careerGrowth: 4 } },
  ];

  await EmployeeExperience.insertMany(experiences);
  console.log(`✅ Inserted ${experiences.length} reviews`);

  const jobs = [
    { company: createdCompanies[0]._id, title: "React Developer", type: "Full-time", location: "Bengaluru", description: "Build modern web apps using React.", skills: ["React", "JavaScript", "CSS"], salary: { min: 800000, max: 1500000 } },
    { company: createdCompanies[1]._id, title: "Machine Learning Engineer", type: "Full-time", location: "Hyderabad", description: "Work on cutting-edge ML models.", skills: ["Python", "TensorFlow", "PyTorch"], salary: { min: 2000000, max: 4000000 } },
    { company: createdCompanies[4]._id, title: "Data Analytics Intern", type: "Internship", location: "Bengaluru", description: "Analyse product and sales data.", skills: ["Python", "SQL", "Excel"], salary: { min: 25000, max: 40000 } },
    { company: createdCompanies[5]._id, title: "Node.js Backend Developer", type: "Full-time", location: "Bengaluru", description: "Build robust payment APIs.", skills: ["Node.js", "MongoDB", "Redis"], salary: { min: 1200000, max: 2200000 } },
  ];

  await Job.insertMany(jobs);
  console.log(`✅ Inserted ${jobs.length} jobs`);

  console.log("\n🎉 Database seeded successfully!\n");
  process.exit(0);
};

seedDB().catch((err) => { console.error(err); process.exit(1); });
