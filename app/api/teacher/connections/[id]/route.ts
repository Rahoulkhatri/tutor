import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, CONNECTIONS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * PATCH: Teacher accepts or declines a connection request.
 * Body: { action: "accept" | "decline" }
 */
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
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid connection id" }, { status: 400 });
    }

    const body = await request.json();
    const action = body.action === "accept" ? "accept" : body.action === "decline" ? "decline" : null;
    if (!action) {
      return NextResponse.json({ error: "action must be 'accept' or 'decline'" }, { status: 400 });
    }

    const db = await getDb();
    const coll = db.collection(CONNECTIONS_COLLECTION);
    const oid = new ObjectId(id);
    const conn = await coll.findOne({ _id: oid, teacherId: session.userId, status: "pending" });
    if (!conn) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "accept") {
      await coll.updateOne({ _id: oid }, { $set: { status: "active", updatedAt: new Date() } });
      return NextResponse.json({ success: true, status: "active" });
    }
    await coll.updateOne({ _id: oid }, { $set: { status: "declined", updatedAt: new Date() } });
    return NextResponse.json({ success: true, status: "declined" });
  } catch (e) {
    console.error("PATCH /api/teacher/connections/[id] error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
