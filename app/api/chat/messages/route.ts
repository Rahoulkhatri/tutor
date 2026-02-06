import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

function validId(id: unknown): id is string {
  return typeof id === "string" && /^\d+$/.test(id.trim());
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const withUserId = (request.nextUrl.searchParams.get("with") || "").trim();
    if (!withUserId || !validId(withUserId)) {
      return NextResponse.json({ messages: [] });
    }

    const myId = parseInt(session.userId, 10);
    const otherId = parseInt(withUserId, 10);
    if (Number.isNaN(myId)) {
      return NextResponse.json({ messages: [] });
    }

    const { rows: messages } = await query<{
      id: number;
      sender_id: number;
      receiver_id: number;
      text: string;
      created_at: Date;
    }>(
      `SELECT id, sender_id, receiver_id, text, created_at FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC LIMIT 200`,
      [myId, otherId]
    );

    const list = messages.map((m) => ({
      id: String(m.id),
      senderId: String(m.sender_id),
      receiverId: String(m.receiver_id),
      text: m.text,
      time: m.created_at,
      isSent: m.sender_id === myId,
    }));

    return NextResponse.json({ messages: list });
  } catch (e) {
    console.error("GET /api/chat/messages error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
