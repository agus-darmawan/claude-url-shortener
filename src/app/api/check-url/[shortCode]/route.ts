import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: { shortCode: string } },
) {
  try {
    const { shortCode } = params;

    const url = await prisma.url.findUnique({
      where: { shortCode },
      select: {
        id: true,
        isActive: true,
        isPasswordProtected: true,
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

    return NextResponse.json({
      isPasswordProtected: url.isPasswordProtected,
      isActive: url.isActive,
    });
  } catch (error) {
    console.error("Error checking URL:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
