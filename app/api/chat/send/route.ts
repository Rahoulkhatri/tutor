import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { queryOne, query } from "@/lib/db";

function validId(id: unknown): id is string {
  return typeof id === "string" && /^\d+$/.test(id.trim());
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const toUserId = (body.toUserId as string)?.trim();
    const text = (body.text as string)?.trim();

    if (!toUserId || !validId(toUserId)) {
      return NextResponse.json(
        { error: "Invalid recipient" },
        { status: 400 }
      );
    }
    if (!text || text.length > 5000) {
      return NextResponse.json(
        {
          error: "Message text required (max 5000 chars)",
        },
        { status: 400 }
      );
    }

    const recipient = await queryOne(
      "SELECT id FROM users WHERE id = $1",
      [parseInt(toUserId, 10)]
    );
    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    const senderId = parseInt(session.userId, 10);
    const receiverId = parseInt(toUserId, 10);
    if (Number.isNaN(senderId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await query(
      `INSERT INTO messages (sender_id, receiver_id, text) VALUES ($1, $2, $3)`,
      [senderId, receiverId, text]
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("POST /api/chat/send error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
