const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 100 },
    email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Invalid email"] },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    phone: { type: String, trim: true, default: null },
    role: { type: String, enum: ["jobseeker", "employer", "admin"], default: "jobseeker" },
    verification: {
      emailVerified: { type: Boolean, default: false },
      emailToken: { type: String, default: null },
      phoneVerified: { type: Boolean, default: false },
      phoneOTP: { type: String, default: null },
      phoneOTPExpiry: { type: Date, default: null },
      resumeVerified: { type: Boolean, default: false },
    },
    resume: { type: String, default: null },
    profilePicture: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update isVerified based on email verification
UserSchema.methods.checkVerified = function () {
  this.isVerified = this.verification.emailVerified;
};

module.exports = mongoose.model("User", UserSchema);
