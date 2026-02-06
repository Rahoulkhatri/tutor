import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { queryOne, query } from "@/lib/db";

function validId(id: unknown): id is string {
  return typeof id === "string" && /^\d+$/.test(id.trim());
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || !validId(id)) {
      return NextResponse.json({ error: "Invalid offer id" }, { status: 400 });
    }

    const offerId = parseInt(id, 10);
    const userId = parseInt(session.userId, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const existing = await queryOne<{
      subject: string | null;
      subject_badge: string | null;
      rate: string;
      location: string | null;
      description: string | null;
      status: string;
    }>(
      "SELECT subject, subject_badge, rate, location, description, status FROM teaching_offers WHERE id = $1 AND user_id = $2",
      [offerId, userId]
    );
    if (!existing) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const body = await request.json();
    let status = existing.status;
    if (
      typeof body.status === "string" &&
      (body.status === "paused" || body.status === "active")
    ) {
      status = body.status;
    }
    let subject = existing.subject;
    if (body.subject !== undefined) {
      subject =
        typeof body.subject === "string" ? body.subject.trim() : existing.subject;
    }
    let subjectBadge = existing.subject_badge;
    if (body.subjectBadge !== undefined) {
      subjectBadge =
        typeof body.subjectBadge === "string"
          ? body.subjectBadge.trim()
          : existing.subject_badge;
    }
    let rate = Number(existing.rate) || 0;
    if (body.rate !== undefined) {
      rate = Math.max(0, Number(body.rate) || 0);
    }
    let location = existing.location;
    if (body.location !== undefined) {
      location =
        typeof body.location === "string"
          ? body.location.trim()
          : existing.location;
    }
    let description = existing.description;
    if (body.description !== undefined) {
      description =
        typeof body.description === "string"
          ? body.description.trim()
          : existing.description;
    }

    await query(
      `UPDATE teaching_offers SET subject = $1, subject_badge = $2, rate = $3, location = $4, description = $5, status = $6, updated_at = NOW() WHERE id = $7 AND user_id = $8`,
      [subject, subjectBadge, rate, location, description, status, offerId, userId]
    );

    return NextResponse.json({
      id,
      subject,
      subjectBadge,
      rate,
      location,
      description,
      status,
    });
  } catch (e) {
    console.error("PATCH /api/teacher/offers/[id] error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
