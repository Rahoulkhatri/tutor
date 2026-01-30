import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, MESSAGES_COLLECTION, USERS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const toUserId = (body.toUserId as string)?.trim();
    const text = (body.text as string)?.trim();

    if (!toUserId || !ObjectId.isValid(toUserId)) {
      return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
    }
    if (!text || text.length > 5000) {
      return NextResponse.json({ error: "Message text required (max 5000 chars)" }, { status: 400 });
    }

    const db = await getDb();
    const recipient = await db
      .collection(USERS_COLLECTION)
      .findOne({ _id: new ObjectId(toUserId) });
    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const doc = {
      senderId: String(session.userId),
      receiverId: String(toUserId),
      text,
      createdAt: new Date(),
    };
    await db.collection(MESSAGES_COLLECTION).insertOne(doc);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("POST /api/chat/send error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
