import { type NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";
import prisma from "@/lib/prisma";
import { passwordAccessSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: { shortCode: string } },
) {
  try {
    const { shortCode } = params;
    const body = await request.json();

    // Validate input
    const validation = passwordAccessSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    const { password } = validation.data;

    // Find the URL
    const url = await prisma.url.findUnique({
      where: { shortCode },
      select: {
        id: true,
        isPasswordProtected: true,
        password: true,
        isActive: true,
        expiresAt: true,
      },
    });

    if (!url) {
      return NextResponse.json({ message: "URL not found" }, { status: 404 });
    }

    if (!url.isActive) {
      return NextResponse.json(
        { message: "URL is not active" },
        { status: 403 },
      );
    }

    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return NextResponse.json({ message: "URL has expired" }, { status: 403 });
    }

    if (!url.isPasswordProtected || !url.password) {
      return NextResponse.json(
        { message: "URL is not password protected" },
        { status: 400 },
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, url.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 },
      );
    }

    // Set session cookie for password access
    const response = NextResponse.json({ message: "Access granted" });

    // Set a cookie that expires in 1 hour
    response.cookies.set(`pwd_${shortCode}`, "granted", {
      maxAge: 60 * 60, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
