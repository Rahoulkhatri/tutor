/**
 * Seed MongoDB with admin, student, and teacher users.
 * Run: npm run db:seed
 * Requires: MONGODB_URI in .env (e.g. mongodb://localhost:27017)
 */
import { MongoClient } from "mongodb";
import * as bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB || "tutorconnect";
const USERS_COLLECTION = "users";

async function main() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
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
  console.error(e);
  process.exit(1);
});
