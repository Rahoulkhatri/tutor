import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const studentId = parseInt(session.userId, 10);
    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { rows: sessions } = await query<{
      id: number;
      teacher_id: number;
      subject: string | null;
      scheduled_at: Date;
      duration_hours: string;
      amount: string;
      status: string;
    }>(
      "SELECT id, teacher_id, subject, scheduled_at, duration_hours, amount, status FROM sessions WHERE student_id = $1 ORDER BY scheduled_at DESC LIMIT 100",
      [studentId]
    );

    const teacherIds = [...new Set(sessions.map((s) => s.teacher_id))];
    let teacherMap: Record<number, string> = {};
    if (teacherIds.length > 0) {
      const placeholders = teacherIds.map((_, i) => `$${i + 1}`).join(", ");
      const { rows: userRows } = await query<{ id: number; name: string | null }>(
        `SELECT id, name FROM users WHERE id IN (${placeholders})`,
        teacherIds
      );
      teacherMap = Object.fromEntries(
        userRows.map((t) => [t.id, t.name || "Teacher"])
      );
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalPaid = 0;
    let thisMonthPaid = 0;
    const payments = sessions.map((s) => {
      const amount = Number(s.amount) || 0;
      totalPaid += amount;
      if (
        s.scheduled_at &&
        new Date(s.scheduled_at) >= startOfMonth
      ) {
        thisMonthPaid += amount;
      }
      return {
        id: String(s.id),
        teacherId: String(s.teacher_id),
        teacherName: teacherMap[s.teacher_id] || "Teacher",
        subject: s.subject || "Session",
        scheduledAt: s.scheduled_at,
        durationHours: s.duration_hours ?? 1,
        amount,
        status: s.status || "confirmed",
      };
    });

    return NextResponse.json({
      payments,
      totalPaid,
      thisMonthPaid,
    });
  } catch (e) {
    console.error("GET /api/student/payments error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
