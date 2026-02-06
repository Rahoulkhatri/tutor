import { NextRequest, NextResponse } from "next/server";
import { queryOne, query } from "@/lib/db";
import { createSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

const ROLES = ["student", "teacher"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body as {
      email?: string;
      password?: string;
      name?: string;
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
        { error: "Signup is for student or teacher only" },
        { status: 400 }
      );
    }

    const existing = await queryOne(
      "SELECT id FROM users WHERE email = $1",
      [email.trim().toLowerCase()]
    );
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await query<{ id: number }>(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id`,
      [email.trim().toLowerCase(), passwordHash, name?.trim() || null, role]
    );
    const newId = rows[0]?.id;

    if (!newId) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    await createSession({
      userId: String(newId),
      email: email.trim().toLowerCase(),
      name: name?.trim() || null,
      role: role as "student" | "teacher" | "admin",
    });

    const redirectUrl =
      role === "teacher" ? "/teacher-dashboard.html" : "/student-dashboard.html";
    return NextResponse.json({ success: true, redirectUrl });
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
