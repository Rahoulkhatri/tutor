/**
 * Seed MongoDB with admin, student, and teacher users.
 * Run: npm run db:seed
 * Uses MONGODB_URI from .env, or falls back to mongodb://localhost:27017
 */
require("dotenv").config();
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const DB_NAME = process.env.MONGODB_DB || "tutorconnect";
const USERS_COLLECTION = "users";
const LOCAL_URI = "mongodb://localhost:27017";

function isConnectionError(e) {
  const msg = e && e.message ? e.message : "";
  const code = e && e.code;
  return code === "ENODATA" || code === "ECONNREFUSED" || msg.includes("querySrv");
}

async function connectWithFallback() {
  const uri = process.env.MONGODB_URI || LOCAL_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    return { client, usedLocal: uri === LOCAL_URI };
  } catch (e) {
    await client.close().catch(() => {});
    if (uri !== LOCAL_URI && isConnectionError(e)) {
      const localClient = new MongoClient(LOCAL_URI);
      try {
        await localClient.connect();
        await localClient.db("admin").command({ ping: 1 });
        console.log("Using local MongoDB (localhost:27017). For cloud, set a working MONGODB_URI in .env\n");
        return { client: localClient, usedLocal: true };
      } catch {
        await localClient.close().catch(() => {});
      }
    }
    throw e;
  }
}

async function main() {
  const { client, usedLocal } = await connectWithFallback();
  const db = client.db(DB_NAME);
  const users = db.collection(USERS_COLLECTION);

  await users.createIndex({ email: 1 }, { unique: true });

  const adminHash = await bcrypt.hash("admin123", 10);
  const studentHash = await bcrypt.hash("student123", 10);
  const teacherHash = await bcrypt.hash("teacher123", 10);

  const now = new Date();
  const defaultUsers = [
    {
      email: "admin@tutorconnect.com",
      passwordHash: adminHash,
      name: "Admin User",
      role: "admin",
      createdAt: now,
      updatedAt: now,
    },
    {
      email: "student@tutorconnect.com",
      passwordHash: studentHash,
      name: "Ayesha Malik",
      role: "student",
      createdAt: now,
      updatedAt: now,
    },
    {
      email: "teacher@tutorconnect.com",
      passwordHash: teacherHash,
      name: "Fatima K.",
      role: "teacher",
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const u of defaultUsers) {
    await users.updateOne(
      { email: u.email },
      { $setOnInsert: u },
      { upsert: true }
    );
  }

  console.log("MongoDB seed done. Users:");
  console.log("  admin@tutorconnect.com / admin123 (Admin)");
  console.log("  student@tutorconnect.com / student123 (Student)");
  console.log("  teacher@tutorconnect.com / teacher123 (Teacher)");
  await client.close();
}

main().catch((e) => {
  const isDns = e.code === "ENODATA" || (e.message && e.message.includes("querySrv"));
  const isRefused = e.code === "ECONNREFUSED";
  if (isDns) {
    console.error("\n❌ Could not resolve MongoDB host, and local MongoDB is not running.");
    console.error("   Option A: Start MongoDB locally, then run npm run db:seed again.");
    console.error("   Option B: Set MONGODB_URI in .env to a working Atlas URL (cluster0.xxxxx.mongodb.net).\n");
  } else if (isRefused) {
    console.error("\n❌ MongoDB is not running. Start MongoDB (e.g. net start MongoDB on Windows), then run npm run db:seed again.\n");
  } else {
    console.error(e);
  }
  process.exit(1);
});
