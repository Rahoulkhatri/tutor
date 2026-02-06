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

    const { rows: offers } = await query<{
      id: number;
      user_id: number;
      subject: string | null;
      subject_badge: string | null;
      rate: string;
      location: string | null;
      description: string | null;
    }>(
      "SELECT id, user_id, subject, subject_badge, rate, location, description FROM teaching_offers WHERE status = $1",
      ["active"]
    );

    const teacherIds = [...new Set(offers.map((o) => o.user_id))];
    let teachers: { id: number; name: string | null }[] = [];
    if (teacherIds.length > 0) {
      const placeholders = teacherIds.map((_, i) => `$${i + 1}`).join(", ");
      const { rows } = await query<{ id: number; name: string | null }>(
        `SELECT id, name FROM users WHERE id IN (${placeholders})`,
        teacherIds
      );
      teachers = rows;
    }
    const teacherMap = Object.fromEntries(teachers.map((t) => [t.id, t]));

    const { rows: myConnections } = await query<{
      teacher_id: number;
      status: string;
    }>("SELECT teacher_id, status FROM connections WHERE student_id = $1", [
      studentId,
    ]);
    const connectionByTeacher = Object.fromEntries(
      myConnections.map((c) => [String(c.teacher_id), c.status])
    );

    const courses = offers.map((o) => {
      const teacherId = String(o.user_id);
      const teacher = teacherMap[o.user_id];
      const connectionStatus = connectionByTeacher[teacherId] || "none";
      return {
        id: String(o.id),
        offerId: String(o.id),
        teacherId,
        teacherName: teacher?.name || "Teacher",
        teacherInitials: teacher?.name
          ? teacher.name
              .trim()
              .split(/\s+/)
              .map((n: string) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : "T",
        title: o.subject || "Tutoring",
        subjectBadge: o.subject_badge || o.subject || "Subject",
        rate:
          o.rate != null
            ? `Rs. ${Number(o.rate).toLocaleString()}/hour`
            : "",
        location: o.location || "",
        description: o.description || "",
        connectionStatus,
      };
    });

    return NextResponse.json({ courses });
  } catch (e) {
    console.error("GET /api/student/offers error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
