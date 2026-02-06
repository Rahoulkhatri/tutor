/**
 * Seed PostgreSQL with admin, students, teachers, and related test data.
 * Run: npm run db:seed
 * All test users password: password123 (except admin: admin123)
 */
require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://localhost:5432/tutorconnect";

function getDbName(url) {
  const part = url.split("/").filter(Boolean).pop();
  return part ? part.split("?")[0] : "tutorconnect";
}

function getPostgresUrl(url) {
  return url.replace(/\/[^/]*(\?.*)?$/, "/postgres$1");
}

async function ensureDatabase() {
  const dbName = getDbName(connectionString);
  const postgresUrl = getPostgresUrl(connectionString);
  const adminPool = new Pool({ connectionString: postgresUrl });
  const r = await adminPool.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );
  if (r.rows.length === 0) {
    if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
      throw new Error(`Invalid database name: ${dbName}`);
    }
    await adminPool.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Database "${dbName}" created.`);
  }
  await adminPool.end();
}

async function main() {
  await ensureDatabase();

  const pool = new Pool({ connectionString });

  const sqlPath = path.join(__dirname, "init-pg.sql");
  const schemaSql = fs.readFileSync(sqlPath, "utf8");
  await pool.query(schemaSql);
  console.log("Schema applied (init-pg.sql).");

  // Truncate in FK order so we get a clean, repeatable seed
  await pool.query("TRUNCATE messages, sessions, connections, teaching_offers, users RESTART IDENTITY CASCADE");
  console.log("Tables truncated.");

  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("password123", 10);

  const usersToInsert = [
    { email: "admin@tutorconnect.com", name: "Admin User", role: "admin", hash: adminHash },
    { email: "student@tutorconnect.com", name: "Ayesha Malik", role: "student", hash: userHash },
    { email: "teacher@tutorconnect.com", name: "Fatima K.", role: "teacher", hash: userHash },
    { email: "ali.khan@test.com", name: "Ali Khan", role: "student", hash: userHash },
    { email: "sara.ahmed@test.com", name: "Sara Ahmed", role: "student", hash: userHash },
    { email: "omar.hassan@test.com", name: "Omar Hassan", role: "student", hash: userHash },
    { email: "zainab.rizvi@test.com", name: "Zainab Rizvi", role: "student", hash: userHash },
    { email: "hassan.mahmood@test.com", name: "Hassan Mahmood", role: "student", hash: userHash },
    { email: "mariam.qureshi@test.com", name: "Mariam Qureshi", role: "student", hash: userHash },
    { email: "usman.ali@test.com", name: "Usman Ali", role: "student", hash: userHash },
    { email: "teacher.rahim@test.com", name: "Rahim Sheikh", role: "teacher", hash: userHash },
    { email: "teacher.nadia@test.com", name: "Nadia Hussain", role: "teacher", hash: userHash },
    { email: "teacher.kamran@test.com", name: "Kamran Malik", role: "teacher", hash: userHash },
    { email: "teacher.sana@test.com", name: "Sana Khan", role: "teacher", hash: userHash },
    { email: "teacher.faisal@test.com", name: "Faisal Ahmed", role: "teacher", hash: userHash },
    { email: "teacher.layla@test.com", name: "Layla Hassan", role: "teacher", hash: userHash },
  ];

  for (const u of usersToInsert) {
    await pool.query(
      "INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)",
      [u.email, u.hash, u.name, u.role]
    );
  }

  const { rows: users } = await pool.query("SELECT id, email, name, role FROM users ORDER BY id");
  const byEmail = Object.fromEntries(users.map((r) => [r.email, r]));
  const students = users.filter((r) => r.role === "student");
  const teachers = users.filter((r) => r.role === "teacher");

  console.log(`Inserted ${users.length} users (${students.length} students, ${teachers.length} teachers).`);

  // Teaching offers: multiple per teacher, various subjects
  const offersData = [
    { email: "teacher@tutorconnect.com", subject: "Mathematics Tutor", badge: "High School Math", rate: 2000, location: "Gulshan-e-Iqbal, Karachi", desc: "Algebra, geometry, calculus.", status: "active" },
    { email: "teacher@tutorconnect.com", subject: "Physics Tutor", badge: "AP Physics", rate: 2200, location: "Defence, Karachi", desc: "AP Physics for advanced students.", status: "active" },
    { email: "teacher@tutorconnect.com", subject: "Test Prep", badge: "SAT/ACT", rate: 2400, location: "Clifton, Karachi", desc: "SAT/ACT preparation.", status: "active" },
    { email: "teacher.rahim@test.com", subject: "Chemistry", badge: "O-Level", rate: 1800, location: "DHA, Karachi", desc: "Organic and inorganic chemistry.", status: "active" },
    { email: "teacher.rahim@test.com", subject: "Biology", badge: "A-Level", rate: 1900, location: "DHA, Karachi", desc: "Cell biology, genetics.", status: "active" },
    { email: "teacher.nadia@test.com", subject: "English Literature", badge: "IELTS", rate: 1500, location: "Bahria Town", desc: "Essay writing, comprehension.", status: "active" },
    { email: "teacher.nadia@test.com", subject: "Creative Writing", badge: "Creative", rate: 1600, location: "Online", desc: "Fiction and non-fiction.", status: "paused" },
    { email: "teacher.kamran@test.com", subject: "Computer Science", badge: "Programming", rate: 2500, location: "Korangi", desc: "Python, data structures.", status: "active" },
    { email: "teacher.kamran@test.com", subject: "Web Development", badge: "Full Stack", rate: 2800, location: "Online", desc: "React, Node.js.", status: "active" },
    { email: "teacher.sana@test.com", subject: "Urdu", badge: "Matric", rate: 1200, location: "Nazimabad", desc: "Grammar and composition.", status: "active" },
    { email: "teacher.sana@test.com", subject: "Pakistan Studies", badge: "O-Level", rate: 1300, location: "Nazimabad", desc: "History and geography.", status: "active" },
    { email: "teacher.faisal@test.com", subject: "Accounting", badge: "CA Foundation", rate: 2000, location: "I.I. Chundrigar", desc: "Financial accounting.", status: "active" },
    { email: "teacher.faisal@test.com", subject: "Economics", badge: "A-Level", rate: 2100, location: "Online", desc: "Micro and macro economics.", status: "active" },
    { email: "teacher.layla@test.com", subject: "Art & Design", badge: "Portfolio", rate: 2200, location: "Clifton", desc: "Sketching, digital art.", status: "active" },
  ];

  for (const o of offersData) {
    const u = byEmail[o.email];
    if (u) {
      await pool.query(
        `INSERT INTO teaching_offers (user_id, subject, subject_badge, rate, location, description, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [u.id, o.subject, o.badge, o.rate, o.location, o.desc, o.status]
      );
    }
  }
  console.log(`Inserted ${offersData.length} teaching offers.`);

  // Connections: active, pending, declined (student-teacher)
  const teacherMain = byEmail["teacher@tutorconnect.com"]?.id;
  const teacherRahim = byEmail["teacher.rahim@test.com"]?.id;
  const teacherNadia = byEmail["teacher.nadia@test.com"]?.id;
  const teacherKamran = byEmail["teacher.kamran@test.com"]?.id;
  const studentMain = byEmail["student@tutorconnect.com"]?.id;
  const studentAli = byEmail["ali.khan@test.com"]?.id;
  const studentSara = byEmail["sara.ahmed@test.com"]?.id;
  const studentOmar = byEmail["omar.hassan@test.com"]?.id;
  const studentZainab = byEmail["zainab.rizvi@test.com"]?.id;

  const connectionsData = [
    { studentId: studentMain, teacherId: teacherMain, subject: "Mathematics Expert", location: "Gulshan-e-Iqbal", rate: 2000, status: "active" },
    { studentId: studentAli, teacherId: teacherMain, subject: "Physics", location: "Defence", rate: 2200, status: "active" },
    { studentId: studentSara, teacherId: teacherRahim, subject: "Chemistry", location: "DHA", rate: 1800, status: "active" },
    { studentId: studentOmar, teacherId: teacherNadia, subject: "English", location: "Online", rate: 1500, status: "active" },
    { studentId: studentZainab, teacherId: teacherKamran, subject: "Programming", location: "Online", rate: 2500, status: "active" },
    { studentId: studentAli, teacherId: teacherRahim, subject: "Biology", location: "DHA", rate: 1900, status: "pending", budget: "Rs. 5000/month" },
    { studentId: studentSara, teacherId: teacherMain, subject: "Math", location: "Gulshan", rate: 2000, status: "pending", budget: "Rs. 8000" },
    { studentId: studentOmar, teacherId: teacherKamran, subject: "Web Dev", location: "Online", rate: 2800, status: "pending", budget: "Rs. 10000" },
    { studentId: studentZainab, teacherId: teacherNadia, subject: "Creative Writing", location: "Online", rate: 1600, status: "declined" },
  ];

  for (const c of connectionsData) {
    if (c.studentId && c.teacherId) {
      await pool.query(
        `INSERT INTO connections (student_id, teacher_id, subject, location, rate, budget, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [c.studentId, c.teacherId, c.subject, c.location || null, c.rate, c.budget || null, c.status]
      );
    }
  }
  console.log(`Inserted ${connectionsData.length} connections.`);

  // Sessions: past (completed) and upcoming (confirmed)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const sessionsData = [
    { studentId: studentMain, teacherId: teacherMain, subject: "Mathematics", at: new Date(today.getTime() + 15 * 60 * 60 * 1000), hrs: 1, amount: 2000, status: "confirmed" },
    { studentId: studentMain, teacherId: teacherMain, subject: "Physics", at: new Date(tomorrow.getTime() + 14 * 60 * 60 * 1000), hrs: 1.5, amount: 3300, status: "confirmed" },
    { studentId: studentMain, teacherId: teacherMain, subject: "Math Revision", at: new Date(lastWeek.getTime() + 10 * 60 * 60 * 1000), hrs: 1, amount: 2000, status: "completed" },
    { studentId: studentAli, teacherId: teacherMain, subject: "Physics", at: new Date(tomorrow.getTime() + 16 * 60 * 60 * 1000), hrs: 1, amount: 2200, status: "confirmed" },
    { studentId: studentAli, teacherId: teacherMain, subject: "Physics Intro", at: new Date(lastWeek.getTime() + 11 * 60 * 60 * 1000), hrs: 1, amount: 2200, status: "completed" },
    { studentId: studentSara, teacherId: teacherRahim, subject: "Chemistry", at: new Date(nextWeek.getTime() + 9 * 60 * 60 * 1000), hrs: 1, amount: 1800, status: "confirmed" },
    { studentId: studentSara, teacherId: teacherRahim, subject: "Organic Chem", at: new Date(lastWeek.getTime() + 14 * 60 * 60 * 1000), hrs: 1.5, amount: 2700, status: "completed" },
    { studentId: studentOmar, teacherId: teacherNadia, subject: "English Essay", at: new Date(tomorrow.getTime() + 17 * 60 * 60 * 1000), hrs: 1, amount: 1500, status: "confirmed" },
    { studentId: studentOmar, teacherId: teacherNadia, subject: "IELTS Prep", at: new Date(lastWeek.getTime() + 15 * 60 * 60 * 1000), hrs: 2, amount: 3000, status: "completed" },
    { studentId: studentZainab, teacherId: teacherKamran, subject: "Python Basics", at: new Date(nextWeek.getTime() + 10 * 60 * 60 * 1000), hrs: 1.5, amount: 3750, status: "confirmed" },
    { studentId: studentZainab, teacherId: teacherKamran, subject: "Data Structures", at: new Date(lastWeek.getTime() + 16 * 60 * 60 * 1000), hrs: 1, amount: 2500, status: "completed" },
  ];

  for (const s of sessionsData) {
    if (s.studentId && s.teacherId) {
      await pool.query(
        `INSERT INTO sessions (student_id, teacher_id, subject, scheduled_at, duration_hours, amount, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [s.studentId, s.teacherId, s.subject, s.at, s.hrs, s.amount, s.status]
      );
    }
  }
  console.log(`Inserted ${sessionsData.length} sessions.`);

  // Messages: conversations between connected users
  const messagesData = [
    { from: "student@tutorconnect.com", to: "teacher@tutorconnect.com", texts: ["Hi, I need help with calculus.", "Sure, we can do a session tomorrow.", "Thank you!"] },
    { from: "teacher@tutorconnect.com", to: "student@tutorconnect.com", texts: ["Reminder: session at 3 PM today.", "See you then."] },
    { from: "ali.khan@test.com", to: "teacher@tutorconnect.com", texts: ["Hello, is the physics slot still available?", "Yes, you can book from the dashboard."] },
    { from: "sara.ahmed@test.com", to: "teacher.rahim@test.com", texts: ["When can we start chemistry?", "How about next Monday at 9 AM?"] },
    { from: "teacher.rahim@test.com", to: "sara.ahmed@test.com", texts: ["Done. I've added the topic list."] },
    { from: "omar.hassan@test.com", to: "teacher.nadia@test.com", texts: ["I need help with my essay.", "Send me the topic and I'll review it."] },
    { from: "zainab.rizvi@test.com", to: "teacher.kamran@test.com", texts: ["Hi! Interested in Python classes.", "Great, I have slots this week. Check the offers page."] },
  ];

  let messageCount = 0;
  for (const conv of messagesData) {
    const fromId = byEmail[conv.from]?.id;
    const toId = byEmail[conv.to]?.id;
    if (fromId && toId) {
      for (const text of conv.texts) {
        await pool.query(
          "INSERT INTO messages (sender_id, receiver_id, text) VALUES ($1, $2, $3)",
          [fromId, toId, text]
        );
        messageCount++;
      }
    }
  }
  console.log(`Inserted ${messageCount} messages.`);

  console.log("\nPostgreSQL seed done. All tables populated with related test data.");
  console.log("Test logins: student@tutorconnect.com / teacher@tutorconnect.com / admin@tutorconnect.com");
  console.log("Password for test users: password123 (admin: admin123)");
  await pool.end();
}

main().catch((e) => {
  const code = e?.code || (e?.errors?.[0]?.code);
  if (code === "ECONNREFUSED") {
    console.error("\n❌ PostgreSQL connection refused (port 5432).");
    console.error("   Option A: Install and start PostgreSQL locally, then create database 'tutorconnect'.");
    console.error("   Option B: Use a cloud PostgreSQL (e.g. Neon, Supabase), set DATABASE_URL in .env, then run npm run db:seed again.\n");
  } else {
    console.error(e);
  }
  process.exit(1);
});
