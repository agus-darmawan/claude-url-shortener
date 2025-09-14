import { type NextRequest, NextResponse } from "next/server";
import { parseAnalytics } from "@/lib/analytics";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } },
) {
  try {
    const { shortCode } = params;

    // Find URL
    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url || !url.isActive) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if expired
    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if password protected
    if (url.isPasswordProtected) {
      // Check if user has already entered password (from cookie)
      const passwordCookie = request.cookies.get(`pwd_${shortCode}`);

      if (!passwordCookie || passwordCookie.value !== "granted") {
        // Redirect to password protection page
        return NextResponse.redirect(
          new URL(`/protected/${shortCode}`, request.url),
        );
      }
    }

    // Parse analytics data
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const analyticsData = parseAnalytics(userAgent, ipAddress, referer);

    // Create analytics record and increment click count
    await prisma.$transaction([
      prisma.analytics.create({
        data: {
          urlId: url.id,
          ...analyticsData,
        },
      }),
      prisma.url.update({
        where: { id: url.id },
        data: { clicks: { increment: 1 } },
      }),
    ]);

    // Redirect to original URL
    return NextResponse.redirect(url.originalUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
