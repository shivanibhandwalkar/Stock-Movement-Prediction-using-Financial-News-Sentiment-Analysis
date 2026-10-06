import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Resend } from "resend";
import { PrismaClient } from "@prisma/client";

// Reuse one Prisma client in dev (avoids too many connections on hot reload)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Email is optional: only used when a key exists
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { username, phone, email, password } = validation.data;
    const cleanEmail = email.toLowerCase();

    // Already registered?
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: cleanEmail }, { phone }] },
    });
    if (existing) {
      const field = existing.email === cleanEmail ? "email" : "phone number";
      return NextResponse.json(
        { message: `An account with this ${field} already exists` },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: username,
        email: cleanEmail,
        phone,
        password: hashedPassword,
      },
    });

    // Welcome email (skipped if no key; never blocks registration)
    if (resend) {
      try {
        await resend.emails.send({
          from: process.env.FROM_EMAIL?.trim() || "onboarding@resend.dev",
          to: cleanEmail,
          subject: "Welcome to StockSphere",
          html: `<p>Hi <strong>${username}</strong>, your account has been created. You can now log in.</p>`,
          text: `Hi ${username}, your account has been created. You can now log in.`,
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
      }
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { id: user.id, username: user.name, email: user.email, phone: user.phone },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Invalid JSON format" }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}