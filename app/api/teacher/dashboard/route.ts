import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, USERS_COLLECTION, TEACHING_OFFERS_COLLECTION, CONNECTIONS_COLLECTION, SESSIONS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const userId = session.userId;

    const offers = await db
      .collection(TEACHING_OFFERS_COLLECTION)
      .find({ userId })
      .toArray();

    const connectionsCount = await db
      .collection(CONNECTIONS_COLLECTION)
      .countDocuments({ teacherId: userId, status: "active" });

    const completedSessions = await db
      .collection(SESSIONS_COLLECTION)
      .find({ teacherId: userId, status: "completed" })
      .toArray();

    const totalHours = completedSessions.reduce((sum, s) => sum + (s.durationHours || 0), 0);
    const earnings = completedSessions.reduce((sum, s) => sum + (s.amount || 0), 0);

    const now = new Date();
    const upcomingSessions = await db
      .collection(SESSIONS_COLLECTION)
      .find({ teacherId: userId, scheduledAt: { $gte: now }, status: "confirmed" })
      .sort({ scheduledAt: 1 })
      .limit(10)
      .toArray();

    const pendingMatches = await db
      .collection(CONNECTIONS_COLLECTION)
      .find({ teacherId: userId, status: "pending" })
      .limit(10)
      .toArray();

    const offersFormatted = offers.map((o) => ({
      id: o._id?.toString(),
      title: o.subject || "Tutoring",
      subjectBadge: o.subjectBadge || o.subject || "Subject",
      rate: o.rate != null ? `Rs. ${Number(o.rate).toLocaleString()}/hour` : "",
      rateRaw: o.rate != null ? Number(o.rate) : 0,
      location: o.location || "",
      description: o.description || "",
      status: o.status === "paused" ? "paused" : "active",
    }));

    const sessionsFormatted = await Promise.all(
      upcomingSessions.map(async (s) => {
        const student = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(s.studentId) });
        return {
          id: s._id?.toString(),
          studentId: s.studentId,
          studentName: student?.name || "Student",
          subject: s.subject || "Session",
          scheduledAt: s.scheduledAt,
          durationHours: s.durationHours || 1,
        };
      })
    );

    const pendingFormatted = await Promise.all(
      pendingMatches.map(async (p) => {
        const student = await db.collection(USERS_COLLECTION).findOne({ _id: new ObjectId(p.studentId) });
        return {
          id: p._id?.toString(),
          studentName: student?.name || "Student",
          subject: p.subject || "Tutoring",
          budget: p.budget || "",
          location: p.location || "",
        };
      })
    );

    return NextResponse.json({
      user: { name: session.name, email: session.email, role: session.role },
      stats: {
        activeStudents: connectionsCount,
        earnings: earnings > 0 ? `Rs. ${earnings.toLocaleString()}` : "Rs. 0",
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
