// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const bookingsRoutes = require("./routes/bookings");
const serviceAreasRoutes = require("./routes/service-areas");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) return res.sendStatus(403);
    req.user = userPayload; // { userId, isAdmin, iat, exp }
    next();
  });
}

// -------- AUTH ROUTES -------- //

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, phoneNumber, password, referredByCode } = req.body;
  try {
    if (!email && !phoneNumber) {
      return res.status(400).json({ message: "Either email or phone number is required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      const conflictFields = [];
      if (userExists.email === email) conflictFields.push("email");
      if (userExists.phoneNumber === phoneNumber) conflictFields.push("phone number");
      return res.status(409).json({
        message: `The following already exist: ${conflictFields.join(", ")}`,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email: email || null,
      phoneNumber: phoneNumber || null,
      password: hashedPassword,
    });
    // generate referral code
    newUser.referralCode = `SHELBY-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (referredByCode) {
      const referrer = await User.findOne({ referralCode: referredByCode });
      if (referrer) {
        newUser.referredBy = referrer._id;
        referrer.referralCredits = (referrer.referralCredits || 0) + 10;
        await referrer.save();
      }
    }

    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// CHECK EMAIL UNIQUENESS
app.post("/api/auth/check-uniqueness", async (req, res) => {
  const { email } = req.body;
  try {
    if (email === null) return res.status(200).json({ isUnique: true });
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "Email is already in use" });
    }
    return res.status(200).json({ isUnique: true });
  } catch (err) {
    console.error("Uniqueness Check Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  const { identifier, password } = req.body;
  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier and password are required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET PROFILE
app.get("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// UPDATE PROFILE
app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { name, email, phoneNumber, carInfo, homeAddress } = req.body;
    const updatedData = { name, email, phoneNumber, carInfo, homeAddress };
    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key]
    );
    const user = await User.findByIdAndUpdate(req.user.userId, updatedData, { new: true }).select(
      "-password"
    );
    return res.json(user);
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ADMIN: GET ALL USERS
app.get("/api/auth/allUsers", authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Admin only" });
    const users = await User.find({});
    return res.json(users);
  } catch (err) {
    console.error("allUsers Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// STORE EXPO PUSH TOKEN
app.post("/api/auth/pushtoken", authenticateToken, async (req, res) => {
  const { expoPushToken } = req.body;
  if (!expoPushToken) {
    return res.status(400).json({ message: "Expo push token is required." });
  }
  try {
    const userDoc = await User.findById(req.user.userId);
    if (!userDoc) return res.status(404).json({ message: "User not found." });
    userDoc.expoPushToken = expoPushToken;
    await userDoc.save();
    return res.json({ message: "Expo push token saved successfully." });
  } catch (error) {
    console.error("Error saving push token:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// REQUEST PASSWORD RESET OTP
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found with this email address" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    console.log(`OTP for ${email}: ${otp}`); // dev only
    return res.status(200).json({ message: "Password reset code sent to your email" });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// VERIFY OTP
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in verify-otp:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// RESET PASSWORD
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }
    user.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error in reset-password:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// -------- PROTECTED OTHER ROUTES -------- //

app.use("/api/bookings", authenticateToken, bookingsRoutes);
app.use("/api/service-areas", authenticateToken, serviceAreasRoutes);

// Health check
app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));