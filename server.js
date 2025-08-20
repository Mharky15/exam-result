require("dotenv").config();
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const Examinee = require("./models/Examinee");

const app = express();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cuyapo_exam_portal";
const PORT = process.env.PORT || 3000;

mongoose
  .connect(MONGODB_URI, {})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layout");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => res.json({ ok: true }));

// Home: render search form with school list
app.get("/", async (req, res) => {
  try {
    const schools = await Examinee.distinct("school");
    schools.sort((a, b) => a.localeCompare(b));
    res.render("index", { schools });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Search: handle form submission and search
app.post("/search", async (req, res) => {
  try {
    const { firstName, middleName, lastName, suffix, barangay, school } =
      req.body;

    const norm = (s) => (s || "").trim().replace(/\s+/g, " ");

    const query = {};

    // Exact school match
    if (school) query.school = norm(school);

    // Name fields
    if (firstName) {
      query.firstName = { $regex: new RegExp(`^${norm(firstName)}`, "i") };
    }
    if (middleName) {
      query.middleName = { $regex: new RegExp(`^${norm(middleName)}`, "i") };
    }
    if (lastName) {
      query.lastName = { $regex: new RegExp(`^${norm(lastName)}`, "i") };
    }
    if (suffix) {
      query.suffix = { $regex: new RegExp(`^${norm(suffix)}`, "i") };
    }

    // Barangay
    if (barangay) {
      query.barangay = { $regex: new RegExp(`^${norm(barangay)}`, "i") };
    }

    const results = await Examinee.find(query).lean();
    res.render("results", { results, filters: req.body });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
