import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

const ROLES = ["student", "teacher", "admin"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role } = body as {
      email?: string;
      password?: string;
      role?: string;
    };

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password and role are required" },
        { status: 400 }
      );
    }

    if (!ROLES.includes(role as (typeof ROLES)[number])) {
      return NextResponse.json(
        { error: "Invalid role. Use student, teacher or admin" },
        { status: 400 }
      );
    }

    const user = await queryOne<{
      id: number;
      email: string;
      password_hash: string;
      name: string | null;
      role: string;
    }>(
      "SELECT id, email, password_hash, name, role FROM users WHERE email = $1",
      [email.trim().toLowerCase()]
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (user.role !== role) {
      return NextResponse.json(
        { error: `Please login as ${user.role}. You selected ${role}.` },
        { status: 403 }
      );
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession({
      userId: String(user.id),
      email: user.email,
      name: user.name ?? null,
      role: user.role as "student" | "teacher" | "admin",
    });

    const redirectUrl =
      role === "admin"
        ? "/"
        : role === "teacher"
          ? "/teacher-dashboard.html"
          : "/student-dashboard.html";

    return NextResponse.json({ success: true, redirectUrl });
  } catch (e) {
    console.error("Login error:", e);
    const message =
      e && typeof (e as Error).message === "string" &&
      ((e as Error).message.includes("connect") || (e as Error).message.includes("ECONNREFUSED"))
        ? "Database connection failed. Is PostgreSQL running? Set DATABASE_URL and try again."
        : "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
