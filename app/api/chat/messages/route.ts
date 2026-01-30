import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb, MESSAGES_COLLECTION, USERS_COLLECTION } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const withUserId = (request.nextUrl.searchParams.get("with") || "").trim();
    if (!withUserId || !ObjectId.isValid(withUserId)) {
      return NextResponse.json({ messages: [] });
    }

    const myId = String(session.userId);
    const otherId = String(withUserId);
    const db = await getDb();
    const messages = await db
      .collection(MESSAGES_COLLECTION)
      .find({
        $or: [
          { senderId: myId, receiverId: otherId },
          { senderId: otherId, receiverId: myId },
        ],
      })
      .sort({ createdAt: 1 })
      .limit(200)
      .toArray();

    const list = messages.map((m) => ({
      id: String(m._id),
      senderId: m.senderId,
      receiverId: m.receiverId,
      text: m.text,
      time: m.createdAt,
      isSent: String(m.senderId) === myId,
    }));

    return NextResponse.json({ messages: list });
  } catch (e) {
    console.error("GET /api/chat/messages error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
