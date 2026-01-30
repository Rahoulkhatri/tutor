import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, TEACHING_OFFERS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid offer id" }, { status: 400 });
    }

    const body = await _request.json();
    const db = await getDb();
    const coll = db.collection(TEACHING_OFFERS_COLLECTION);
    const oid = new ObjectId(id);

    const existing = await coll.findOne({ _id: oid, userId: session.userId });
    if (!existing) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    const update: Record<string, unknown> = { updatedAt: new Date() };

    if (typeof body.status === "string" && (body.status === "paused" || body.status === "active")) {
      update.status = body.status;
    }
    if (body.subject !== undefined) update.subject = typeof body.subject === "string" ? body.subject.trim() : existing.subject;
    if (body.subjectBadge !== undefined) update.subjectBadge = typeof body.subjectBadge === "string" ? body.subjectBadge.trim() : existing.subjectBadge;
    if (body.rate !== undefined) update.rate = Math.max(0, Number(body.rate) || 0);
    if (body.location !== undefined) update.location = typeof body.location === "string" ? body.location.trim() : existing.location;
    if (body.description !== undefined) update.description = typeof body.description === "string" ? body.description.trim() : existing.description;

    await coll.updateOne({ _id: oid, userId: session.userId }, { $set: update });

    const updated = await coll.findOne({ _id: oid });
    return NextResponse.json({
      id: updated?._id?.toString(),
      subject: updated?.subject,
      subjectBadge: updated?.subjectBadge,
      rate: updated?.rate,
      location: updated?.location,
      description: updated?.description,
      status: updated?.status,
    });
  } catch (e) {
    console.error("PATCH /api/teacher/offers/[id] error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
