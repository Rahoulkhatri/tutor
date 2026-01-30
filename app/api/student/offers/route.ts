import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, USERS_COLLECTION, TEACHING_OFFERS_COLLECTION, CONNECTIONS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET: List all active teaching offers for students (only status: "active").
 * Includes teacher name and connection status (none / pending / active) for current student.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const studentId = session.userId;

    const offers = await db
      .collection(TEACHING_OFFERS_COLLECTION)
      .find({ status: "active" })
      .toArray();

    const teacherIds = [...new Set(offers.map((o) => o.userId).filter(Boolean))];
    const teachers =
      teacherIds.length > 0
        ? await db
            .collection(USERS_COLLECTION)
            .find({ _id: { $in: teacherIds.map((id) => new ObjectId(id)) } })
            .toArray()
        : [];
    const teacherMap = Object.fromEntries(teachers.map((t) => [t._id.toString(), t]));

    const myConnections = await db
      .collection(CONNECTIONS_COLLECTION)
      .find({ studentId })
      .toArray();
    const connectionByTeacher = Object.fromEntries(
      myConnections.map((c) => [c.teacherId, c.status as string])
    );

    const courses = offers.map((o) => {
      const teacherId = o.userId?.toString();
      const teacher = teacherMap[teacherId];
      const connectionStatus = connectionByTeacher[teacherId] || "none";
      return {
        id: o._id?.toString(),
        offerId: o._id?.toString(),
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
        subjectBadge: o.subjectBadge || o.subject || "Subject",
        rate: o.rate != null ? `Rs. ${Number(o.rate).toLocaleString()}/hour` : "",
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
