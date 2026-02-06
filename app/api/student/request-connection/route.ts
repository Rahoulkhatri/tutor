import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { queryOne, query } from "@/lib/db";

function validId(id: unknown): id is string {
  return typeof id === "string" && /^\d+$/.test(id.trim());
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const offerId = body.offerId;
    if (!offerId || !validId(offerId)) {
      return NextResponse.json(
        { error: "Valid offerId is required" },
        { status: 400 }
      );
    }

    const offer = await queryOne<{
      id: number;
      user_id: number;
      subject: string | null;
      location: string | null;
      rate: string;
    }>(
      "SELECT id, user_id, subject, location, rate FROM teaching_offers WHERE id = $1 AND status = $2",
      [parseInt(offerId, 10), "active"]
    );
    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found or not available" },
        { status: 404 }
      );
    }

    const teacherId = offer.user_id;
    const studentId = parseInt(session.userId, 10);
    if (Number.isNaN(studentId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const existing = await queryOne<{ status: string }>(
      "SELECT status FROM connections WHERE student_id = $1 AND teacher_id = $2",
      [studentId, teacherId]
    );
    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          {
            error: "You are already connected with this teacher",
            alreadyConnected: true,
          },
          { status: 400 }
        );
      }
      if (existing.status === "pending") {
        return NextResponse.json(
          { error: "Request already sent", alreadyPending: true },
          { status: 400 }
        );
      }
    }

    await query(
      `INSERT INTO connections (student_id, teacher_id, subject, location, rate, status)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        studentId,
        teacherId,
        offer.subject || "Tutoring",
        offer.location || "",
        offer.rate ?? 0,
        "pending",
      ]
    );
    return NextResponse.json({
      success: true,
      message: "Request sent. Teacher will respond shortly.",
    });
  } catch (e) {
    console.error("POST /api/student/request-connection error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
