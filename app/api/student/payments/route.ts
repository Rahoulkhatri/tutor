import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, SESSIONS_COLLECTION, USERS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: List payments (fees) the student has made to teachers (from sessions)
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const sessions = await db
      .collection(SESSIONS_COLLECTION)
      .find({ studentId: session.userId })
      .sort({ scheduledAt: -1 })
      .limit(100)
      .toArray();

    const teacherIds = [...new Set(sessions.map((s) => s.teacherId).filter(Boolean))];
    const teachers =
      teacherIds.length > 0
        ? await db
            .collection(USERS_COLLECTION)
            .find({ _id: { $in: teacherIds.map((id) => new ObjectId(id)) } })
            .toArray()
        : [];
    const teacherMap = Object.fromEntries(
      teachers.map((t) => [String(t._id), (t as { name?: string | null }).name || "Teacher"])
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalPaid = 0;
    let thisMonthPaid = 0;
    const payments = sessions.map((s) => {
      const amount = Number(s.amount) || 0;
      totalPaid += amount;
      if (s.scheduledAt && new Date(s.scheduledAt) >= startOfMonth) thisMonthPaid += amount;
      return {
        id: String(s._id),
        teacherId: s.teacherId,
        teacherName: teacherMap[s.teacherId as string] || "Teacher",
        subject: s.subject || "Session",
        scheduledAt: s.scheduledAt,
        durationHours: s.durationHours ?? 1,
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
