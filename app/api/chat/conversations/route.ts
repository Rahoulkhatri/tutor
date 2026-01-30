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

    const includeUserId = request.nextUrl.searchParams.get("with");
    const db = await getDb();
    const userId = String(session.userId);

    const messages = await db
      .collection(MESSAGES_COLLECTION)
      .find({
        $or: [{ senderId: userId }, { receiverId: userId }],
      })
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();

    const otherUserIds = new Set<string>();
    const lastByOther: Record<string, { text: string; time: Date }> = {};
    for (const m of messages) {
      const sender = String(m.senderId);
      const receiver = String(m.receiverId);
      const other = sender === userId ? receiver : sender;
      if (other && !otherUserIds.has(other)) {
        otherUserIds.add(other);
        lastByOther[other] = { text: m.text, time: m.createdAt };
      }
    }

    const users =
      otherUserIds.size > 0
        ? await db
            .collection(USERS_COLLECTION)
            .find({ _id: { $in: Array.from(otherUserIds).map((id) => new ObjectId(id)) } })
            .toArray()
        : [];
    const userMap = Object.fromEntries(
      users.map((u) => [String(u._id), u as { name?: string | null }])
    );

    const conversations = Array.from(otherUserIds).map((uid) => {
      const last = lastByOther[uid];
      const u = userMap[uid];
      return {
        userId: uid,
        name: u?.name || "User",
        initials: (u?.name || "U").trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
        lastMessage: last?.text || "",
        lastMessageAt: last?.time,
      };
    });

    conversations.sort((a, b) => {
      const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return tb - ta;
    });

    if (includeUserId && ObjectId.isValid(includeUserId) && String(includeUserId) !== userId) {
      const already = conversations.some((c) => c.userId === includeUserId);
      if (!already) {
        const user = await db
          .collection(USERS_COLLECTION)
          .findOne({ _id: new ObjectId(includeUserId) });
        if (user) {
          const u = user as { name?: string | null };
          conversations.unshift({
            userId: includeUserId,
            name: u.name || "User",
            initials: (u.name || "U").trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
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
