import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;
    const studentId = parseInt(userId, 10);
    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { rows: connections } = await query<{ teacher_id: number; rate: string | null }>(
      "SELECT teacher_id, rate FROM connections WHERE student_id = $1 AND status = $2",
      [studentId, "active"]
    );
    const teacherIds = [...new Set(connections.map((c) => c.teacher_id))];

    let teachers: { id: number; name: string | null }[] = [];
    if (teacherIds.length > 0) {
      const placeholders = teacherIds.map((_, i) => `$${i + 1}`).join(", ");
      const { rows: userRows } = await query<{ id: number; name: string | null }>(
        `SELECT id, name FROM users WHERE id IN (${placeholders}) AND role = $${teacherIds.length + 1}`,
        [...teacherIds, "teacher"]
      );
      teachers = userRows;
    }
    const teacherMap = Object.fromEntries(teachers.map((t) => [t.id, t]));

    const now = new Date();
    const { rows: upcomingSessions } = await query<{
      id: number;
      teacher_id: number;
      subject: string | null;
      scheduled_at: Date;
      duration_hours: number;
      status: string;
    }>(
      `SELECT id, teacher_id, subject, scheduled_at, duration_hours, status FROM sessions
       WHERE student_id = $1 AND scheduled_at >= $2 AND status = $3 ORDER BY scheduled_at ASC LIMIT 10`,
      [studentId, now, "confirmed"]
    );

    const { rows: completedSessions } = await query<{
      duration_hours: number;
      amount: number;
    }>(
      "SELECT duration_hours, amount FROM sessions WHERE student_id = $1 AND status = $2",
      [studentId, "completed"]
    );

    const hoursCompleted = completedSessions.reduce(
      (sum, s) => sum + Number(s.duration_hours || 0),
      0
    );
    const totalSpent = completedSessions.reduce(
      (sum, s) => sum + Number(s.amount || 0),
      0
    );

    const tutors = connections.map((c) => {
      const t = teacherMap[c.teacher_id];
      return {
        id: String(c.teacher_id),
        name: t?.name || "Teacher",
        initials: t?.name
          ? t.name
              .trim()
              .split(/\s+/)
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : "T",
        subject: "Tutoring",
        location: "",
        rate: c.rate != null ? `Rs. ${Number(c.rate).toLocaleString()}/hour` : "",
        rating: "4.9",
        reviews: 0,
      };
    });

    const sessionsFormatted = upcomingSessions.map((s) => ({
      id: String(s.id),
      teacherId: String(s.teacher_id),
      time: s.scheduled_at,
      subject: s.subject || "Session",
      teacherName: teacherMap[s.teacher_id]?.name || "Teacher",
      duration: s.duration_hours ? `${s.duration_hours} hour(s)` : "1 hour",
      status: s.status,
    }));

    return NextResponse.json({
      user: { name: session.name, email: session.email, role: session.role },
      stats: {
        activeTutors: connections.length,
        hoursCompleted: Math.round(hoursCompleted * 10) / 10,
        averageRating: "4.8",
        totalSpent:
          totalSpent > 0 ? `Rs. ${totalSpent.toLocaleString()}` : "Rs. 0",
      },
      tutors,
      upcomingSessions: sessionsFormatted,
    });
  } catch (e) {
    console.error("Student dashboard error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
