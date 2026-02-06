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

    const includeUserId = request.nextUrl.searchParams.get("with");
    const userId = parseInt(session.userId, 10);
    if (Number.isNaN(userId)) {
      return NextResponse.json({ conversations: [] });
    }

    const { rows: messages } = await query<{
      sender_id: number;
      receiver_id: number;
      text: string;
      created_at: Date;
    }>(
      `SELECT sender_id, receiver_id, text, created_at FROM messages
       WHERE sender_id = $1 OR receiver_id = $1 ORDER BY created_at DESC LIMIT 500`,
      [userId]
    );

    const otherUserIds = new Set<number>();
    const lastByOther: Record<
      number,
      { text: string; time: Date }
    > = {};
    for (const m of messages) {
      const other =
        m.sender_id === userId ? m.receiver_id : m.sender_id;
      if (!otherUserIds.has(other)) {
        otherUserIds.add(other);
        lastByOther[other] = { text: m.text, time: m.created_at };
      }
    }

    let userMap: Record<number, string | null> = {};
    if (otherUserIds.size > 0) {
      const ids = Array.from(otherUserIds);
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(", ");
      const { rows: userRows } = await query<{ id: number; name: string | null }>(
        `SELECT id, name FROM users WHERE id IN (${placeholders})`,
        ids
      );
      userMap = Object.fromEntries(userRows.map((u) => [u.id, u.name]));
    }

    const conversations = Array.from(otherUserIds).map((uid) => {
      const last = lastByOther[uid];
      const name = userMap[uid] || "User";
      return {
        userId: String(uid),
        name,
        initials: (name || "U")
          .trim()
          .split(/\s+/)
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        lastMessage: last?.text || "",
        lastMessageAt: last?.time,
      };
    });

    conversations.sort((a, b) => {
      const ta = a.lastMessageAt
        ? new Date(a.lastMessageAt).getTime()
        : 0;
      const tb = b.lastMessageAt
        ? new Date(b.lastMessageAt).getTime()
        : 0;
      return tb - ta;
    });

    if (
      includeUserId &&
      validId(includeUserId) &&
      String(includeUserId) !== String(userId)
    ) {
      const includeId = parseInt(includeUserId, 10);
      const already = conversations.some((c) => c.userId === includeUserId);
      if (!already) {
        const { rows: userRows } = await query<{ id: number; name: string | null }>(
          "SELECT id, name FROM users WHERE id = $1",
          [includeId]
        );
        const user = userRows[0];
        if (user) {
          const name = user.name || "User";
          conversations.unshift({
            userId: includeUserId,
            name,
            initials: (name || "U")
              .trim()
              .split(/\s+/)
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase(),
            lastMessage: "",
            lastMessageAt: undefined,
          });
        }
      }
    }

    return NextResponse.json({ conversations });
  } catch (e) {
    console.error("GET /api/chat/conversations error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
