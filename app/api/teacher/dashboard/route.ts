import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.userId, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { rows: offers } = await query<{
      id: number;
      subject: string | null;
      subject_badge: string | null;
      rate: string;
      location: string | null;
      description: string | null;
      status: string;
    }>("SELECT id, subject, subject_badge, rate, location, description, status FROM teaching_offers WHERE user_id = $1", [
      userId,
    ]);

    const { rowCount: connectionsCount } = await query(
      "SELECT 1 FROM connections WHERE teacher_id = $1 AND status = $2",
      [userId, "active"]
    );

    const { rows: completedSessions } = await query<{
      duration_hours: string;
      amount: string;
    }>(
      "SELECT duration_hours, amount FROM sessions WHERE teacher_id = $1 AND status = $2",
      [userId, "completed"]
    );

    const totalHours = completedSessions.reduce(
      (sum, s) => sum + Number(s.duration_hours || 0),
      0
    );
    const earnings = completedSessions.reduce(
      (sum, s) => sum + Number(s.amount || 0),
      0
    );

    const now = new Date();
    const { rows: upcomingSessions } = await query<{
      id: number;
      student_id: number;
      subject: string | null;
      scheduled_at: Date;
      duration_hours: string;
    }>(
      `SELECT id, student_id, subject, scheduled_at, duration_hours FROM sessions
       WHERE teacher_id = $1 AND scheduled_at >= $2 AND status = $3 ORDER BY scheduled_at ASC LIMIT 10`,
      [userId, now, "confirmed"]
    );

    const { rows: pendingMatches } = await query<{
      id: number;
      student_id: number;
      subject: string | null;
      budget: string | null;
      location: string | null;
    }>(
      "SELECT id, student_id, subject, budget, location FROM connections WHERE teacher_id = $1 AND status = $2 LIMIT 10",
      [userId, "pending"]
    );

    const studentIds = [
      ...new Set([
        ...upcomingSessions.map((s) => s.student_id),
        ...pendingMatches.map((p) => p.student_id),
      ]),
    ];
    let studentMap: Record<number, string | null> = {};
    if (studentIds.length > 0) {
      const placeholders = studentIds.map((_, i) => `$${i + 1}`).join(", ");
      const { rows: userRows } = await query<{ id: number; name: string | null }>(
        `SELECT id, name FROM users WHERE id IN (${placeholders})`,
        studentIds
      );
      studentMap = Object.fromEntries(userRows.map((u) => [u.id, u.name]));
    }

    const offersFormatted = offers.map((o) => ({
      id: String(o.id),
      title: o.subject || "Tutoring",
      subjectBadge: o.subject_badge || o.subject || "Subject",
      rate:
        o.rate != null
          ? `Rs. ${Number(o.rate).toLocaleString()}/hour`
          : "",
      rateRaw: o.rate != null ? Number(o.rate) : 0,
      location: o.location || "",
      description: o.description || "",
      status: o.status === "paused" ? "paused" : "active",
    }));

    const sessionsFormatted = upcomingSessions.map((s) => ({
      id: String(s.id),
      studentId: String(s.student_id),
      studentName: studentMap[s.student_id] || "Student",
      subject: s.subject || "Session",
      scheduledAt: s.scheduled_at,
      durationHours: s.duration_hours || 1,
    }));

    const pendingFormatted = pendingMatches.map((p) => ({
      id: String(p.id),
      studentName: studentMap[p.student_id] || "Student",
      subject: p.subject || "Tutoring",
      budget: p.budget || "",
      location: p.location || "",
    }));

    return NextResponse.json({
      user: { name: session.name, email: session.email, role: session.role },
      stats: {
        activeStudents: connectionsCount ?? 0,
        earnings:
          earnings > 0 ? `Rs. ${earnings.toLocaleString()}` : "Rs. 0",
        rating: "4.9",
        totalHours: Math.round(totalHours * 10) / 10,
      },
      offers: offersFormatted,
      pendingMatches: pendingFormatted,
      upcomingSessions: sessionsFormatted,
    });
  } catch (e) {
    console.error("Teacher dashboard error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
