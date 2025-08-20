require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const mongoose = require("mongoose");
const Examinee = require("../models/Examinee");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cuyapo_exam_portal";

// Simple name splitter
function splitName(fullName) {
  const parts = (fullName || "").trim().split(/\s+/);
  let firstName = "";
  let middleName = "";
  let lastName = "";
  let suffix = "";

  if (parts.length === 1) {
    firstName = parts[0];
  } else if (parts.length === 2) {
    firstName = parts[0];
    lastName = parts[1];
  } else if (parts.length >= 3) {
    firstName = parts[0];
    lastName = parts[parts.length - 1];

    // Handle suffix detection
    const suffixes = ["Jr", "Jr.", "Sr", "Sr.", "III", "IV", "II"];
    if (suffixes.includes(lastName)) {
      suffix = lastName;
      lastName = parts[parts.length - 2];
      middleName = parts.slice(1, parts.length - 2).join(" ");
    } else {
      middleName = parts.slice(1, parts.length - 1).join(" ");
    }
  }

  return { firstName, middleName, lastName, suffix };
}

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, {});
    console.log("✅ MongoDB connected for seeding");

    const csvPath = path.join(__dirname, "..", "exam_result.csv");
    const csv = fs.readFileSync(csvPath, "utf8");
    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const docs = records.map((r) => ({
      firstName: r.firstName,
      middleName: r.middleName,
      lastName: r.lastName,
      suffix: r.suffix,
      barangay: r.barangay,
      school: r.school,
      scores: r.scores,
      stats: r.stats,
    }));

    await Examinee.deleteMany({});
    await Examinee.insertMany(docs);
    console.log(`✅ Seeded ${docs.length} examinee records with name parts`);
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
