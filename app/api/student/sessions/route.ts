import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, SESSIONS_COLLECTION, USERS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// Create a new session from the student side
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

    if (!teacherId || !ObjectId.isValid(teacherId)) {
      return NextResponse.json(
        { error: "Please select a teacher. If the problem continues, refresh and try again." },
        { status: 400 }
      );
    }
    if (!start || typeof start !== "string") {
      return NextResponse.json({ error: "Please select date and time for the session." }, { status: 400 });
    }

    const scheduledAt = new Date(start.trim());
    if (Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json({ error: "Invalid date or time. Please choose a valid date and time." }, { status: 400 });
    }

    if (duration < 0.5 || duration > 24) {
      return NextResponse.json({ error: "Duration must be between 0.5 and 24 hours." }, { status: 400 });
    }

    const db = await getDb();

    // Ensure teacher exists (use same string format as session.userId for teacher dashboard query)
    const teacher = await db
      .collection(USERS_COLLECTION)
      .findOne({ _id: new ObjectId(teacherId), role: "teacher" });
    if (!teacher) {
      return NextResponse.json(
        { error: "This teacher was not found. Please refresh the page and try again." },
        { status: 404 }
      );
    }

    // Store teacherId as string so teacher dashboard (teacherId: session.userId) matches
    const doc = {
      studentId: session.userId,
      teacherId: String(teacherId),
      subject,
      scheduledAt,
      durationHours: duration,
      status: "confirmed",
      amount: body.amount ?? 0,
      createdAt: new Date(),
    };

    const result = await db.collection(SESSIONS_COLLECTION).insertOne(doc);

    return NextResponse.json({
      id: result.insertedId.toString(),
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

