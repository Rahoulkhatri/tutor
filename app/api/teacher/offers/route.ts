import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, TEACHING_OFFERS_COLLECTION } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const subjectBadge = typeof body.subjectBadge === "string" ? body.subjectBadge.trim() : subject || "Subject";
    const rate = typeof body.rate === "number" ? body.rate : Number(body.rate) || 0;
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (!subject) {
      return NextResponse.json({ error: "Subject/title is required" }, { status: 400 });
    }

    const db = await getDb();
    const now = new Date();
    const doc = {
      userId: session.userId,
      subject,
      subjectBadge,
      rate: Math.max(0, rate),
      location,
      description,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection(TEACHING_OFFERS_COLLECTION).insertOne(doc);
    return NextResponse.json({
      id: result.insertedId.toString(),
      subject: doc.subject,
      subjectBadge: doc.subjectBadge,
      rate: doc.rate,
      location: doc.location,
      description: doc.description,
      status: doc.status,
    });
  } catch (e) {
    console.error("POST /api/teacher/offers error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
