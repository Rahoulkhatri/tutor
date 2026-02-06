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
      return NextResponse.json(
        { error: "Invalid connection id" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const action =
      body.action === "accept"
        ? "accept"
        : body.action === "decline"
          ? "decline"
          : null;
    if (!action) {
      return NextResponse.json(
        { error: "action must be 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    const connectionId = parseInt(id, 10);
    const teacherId = parseInt(session.userId, 10);
    if (Number.isNaN(teacherId)) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const conn = await queryOne(
      "SELECT id FROM connections WHERE id = $1 AND teacher_id = $2 AND status = $3",
      [connectionId, teacherId, "pending"]
    );
    if (!conn) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    const newStatus = action === "accept" ? "active" : "declined";
    await query(
      "UPDATE connections SET status = $1, updated_at = NOW() WHERE id = $2",
      [newStatus, connectionId]
    );

    return NextResponse.json({ success: true, status: newStatus });
  } catch (e) {
    console.error("PATCH /api/teacher/connections/[id] error:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
