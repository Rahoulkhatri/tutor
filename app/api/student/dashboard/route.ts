import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, USERS_COLLECTION, CONNECTIONS_COLLECTION, SESSIONS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const userId = session.userId;

    const connections = await db
      .collection(CONNECTIONS_COLLECTION)
      .find({ studentId: userId, status: "active" })
      .toArray();

    const teacherIds = connections.map((c) => c.teacherId);
    const teachers =
      teacherIds.length > 0
        ? await db
            .collection(USERS_COLLECTION)
            .find({ _id: { $in: teacherIds.map((id) => new ObjectId(id)) }, role: "teacher" })
            .toArray()
        : [];

    const teacherMap = Object.fromEntries(teachers.map((t) => [t._id.toString(), t]));

    const now = new Date();
    const upcomingSessions = await db
      .collection(SESSIONS_COLLECTION)
      .find({ studentId: userId, scheduledAt: { $gte: now }, status: "confirmed" })
      .sort({ scheduledAt: 1 })
      .limit(10)
      .toArray();

    const completedSessions = await db
      .collection(SESSIONS_COLLECTION)
      .find({ studentId: userId, status: "completed" })
      .toArray();

    const hoursCompleted = completedSessions.reduce((sum, s) => sum + (s.durationHours || 0), 0);
    const totalSpent = completedSessions.reduce((sum, s) => sum + (s.amount || 0), 0);

    const tutors = connections.map((c) => {
      const t = teacherMap[c.teacherId];
      return {
        id: c.teacherId,
        name: t?.name || "Teacher",
        initials: t?.name ? t.name.trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "T",
        subject: c.subject || "Tutoring",
        location: c.location || "",
        rate: c.rate ? `Rs. ${Number(c.rate).toLocaleString()}/hour` : "",
        rating: c.rating || "4.9",
        reviews: c.reviews || 0,
      };
    });

    const sessionsFormatted = await Promise.all(
      upcomingSessions.map(async (s) => {
        const teacher = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(s.teacherId) });
        return {
          id: s._id?.toString(),
          teacherId: s.teacherId,
          time: s.scheduledAt,
          subject: s.subject || "Session",
          teacherName: teacher?.name || "Teacher",
          duration: s.durationHours ? `${s.durationHours} hour(s)` : "1 hour",
          status: s.status,
        };
      })
    );

    return NextResponse.json({
      user: { name: session.name, email: session.email, role: session.role },
      stats: {
        activeTutors: connections.length,
        hoursCompleted: Math.round(hoursCompleted * 10) / 10,
        averageRating: "4.8",
        totalSpent: totalSpent > 0 ? `Rs. ${totalSpent.toLocaleString()}` : "Rs. 0",
      },
      tutors,
      upcomingSessions: sessionsFormatted,
    });
  } catch (e) {
    console.error("Student dashboard error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
