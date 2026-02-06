import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const subjectBadge =
      typeof body.subjectBadge === "string"
        ? body.subjectBadge.trim()
        : subject || "Subject";
    const rate =
      typeof body.rate === "number" ? body.rate : Number(body.rate) || 0;
    const location =
      typeof body.location === "string" ? body.location.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    if (!subject) {
      return NextResponse.json(
        { error: "Subject/title is required" },
        { status: 400 }
      );
    }

    const userId = parseInt(session.userId, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { rows } = await query<{ id: number }>(
      `INSERT INTO teaching_offers (user_id, subject, subject_badge, rate, location, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        userId,
        subject,
        subjectBadge,
        Math.max(0, rate),
        location,
        description,
        "active",
      ]
    );
    const id = rows[0]?.id;

    return NextResponse.json({
      id: id != null ? String(id) : undefined,
      subject,
      subjectBadge,
      rate: Math.max(0, rate),
      location,
      description,
      status: "active",
    });
  } catch (e) {
    console.error("POST /api/teacher/offers error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
