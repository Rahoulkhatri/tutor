import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, USERS_COLLECTION, TEACHING_OFFERS_COLLECTION, CONNECTIONS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * POST: Student requests to connect / take a course from a teacher.
 * Body: { offerId }
 * Creates a connection with status: "pending". Teacher can accept/decline in their dashboard.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const offerId = body.offerId;
    if (!offerId || !ObjectId.isValid(offerId)) {
      return NextResponse.json({ error: "Valid offerId is required" }, { status: 400 });
    }

    const db = await getDb();
    const oid = new ObjectId(offerId);
    const offer = await db.collection(TEACHING_OFFERS_COLLECTION).findOne({ _id: oid, status: "active" });
    if (!offer) {
      return NextResponse.json({ error: "Offer not found or not available" }, { status: 404 });
    }

    const teacherId = offer.userId?.toString();
    const studentId = session.userId;

    const existing = await db.collection(CONNECTIONS_COLLECTION).findOne({
      studentId,
      teacherId,
    });
    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json({ error: "You are already connected with this teacher", alreadyConnected: true }, { status: 400 });
      }
      if (existing.status === "pending") {
        return NextResponse.json({ error: "Request already sent", alreadyPending: true }, { status: 400 });
      }
    }

    const now = new Date();
    const doc = {
      studentId,
      teacherId,
      subject: offer.subject || "Tutoring",
      location: offer.location || "",
      rate: offer.rate ?? 0,
      status: "pending",
      offerId: offerId,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(CONNECTIONS_COLLECTION).insertOne(doc);
    return NextResponse.json({ success: true, message: "Request sent. Teacher will respond shortly." });
  } catch (e) {
    console.error("POST /api/student/request-connection error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
