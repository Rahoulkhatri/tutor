import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { queryOne, query } from "@/lib/db";

function validTeacherId(id: unknown): id is string {
  return typeof id === "string" && /^\d+$/.test(id.trim());
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const teacherIdRaw = body.teacherId;
    const teacherId = typeof teacherIdRaw === "string" ? teacherIdRaw.trim() : undefined;
    const subject = (body.subject as string | undefined)?.trim() || "Session";
    const start = body.startTime as string | undefined;
    const duration = Number(body.durationHours ?? 1) || 1;

    if (!teacherId || !validTeacherId(teacherId)) {
      return NextResponse.json(
        {
          error:
            "Please select a teacher. If the problem continues, refresh and try again.",
        },
        { status: 400 }
      );
    }
    if (!start || typeof start !== "string") {
      return NextResponse.json(
        { error: "Please select date and time for the session." },
        { status: 400 }
      );
    }

    const scheduledAt = new Date(start.trim());
    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json(
        {
          error:
            "Invalid date or time. Please choose a valid date and time.",
        },
        { status: 400 }
      );
    }

    if (duration < 0.5 || duration > 24) {
      return NextResponse.json(
        { error: "Duration must be between 0.5 and 24 hours." },
        { status: 400 }
      );
    }

    const teacherIdNum = parseInt(teacherId, 10);
    const teacher = await queryOne(
      "SELECT id FROM users WHERE id = $1 AND role = $2",
      [teacherIdNum, "teacher"]
    );
    if (!teacher) {
      return NextResponse.json(
        {
          error:
            "This teacher was not found. Please refresh the page and try again.",
        },
        { status: 404 }
      );
    }

    const studentId = parseInt(session.userId, 10);
    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { rows } = await query<{ id: number }>(
      `INSERT INTO sessions (student_id, teacher_id, subject, scheduled_at, duration_hours, amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        studentId,
        teacherIdNum,
        subject,
        scheduledAt,
        duration,
        body.amount ?? 0,
        "confirmed",
      ]
    );
    const id = rows[0]?.id;

    return NextResponse.json({
      id: id != null ? String(id) : undefined,
      scheduledAt,
      subject,
      durationHours: duration,
      status: "confirmed",
    });
  } catch (e) {
    console.error("POST /api/student/sessions error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
