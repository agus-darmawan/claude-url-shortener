import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession();
    const { id } = params;

    // Check if user owns this URL or if it's public
    const url = await prisma.url.findUnique({
      where: { id },
      select: {
        id: true,
        originalUrl: true,
        shortCode: true,
        customCode: true,
        title: true,
        description: true,
        clicks: true,
        isActive: true,
        isPasswordProtected: true,
        createdAt: true,
        expiresAt: true,
        userId: true,
      },
    });

    if (!url) {
      return NextResponse.json({ message: "URL not found" }, { status: 404 });
    }

    // Check if user has access to this URL
    if (url.userId && url.userId !== session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get analytics data for this specific URL
    const analytics = await prisma.analytics.findMany({
      where: { urlId: id },
      select: {
        country: true,
        device: true,
        browser: true,
        referer: true,
        clickedAt: true,
      },
    });

    // Today's clicks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayClicks = analytics.filter(
      (a) => new Date(a.clickedAt) >= today,
    ).length;

    // Top countries
    const countryStats = analytics.reduce(
      (acc, a) => {
        const country = a.country || "Unknown";
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topCountries = Object.entries(countryStats)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    // Top devices
    const deviceStats = analytics.reduce(
      (acc, a) => {
        const device = a.device || "Desktop";
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topDevices = Object.entries(deviceStats)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    // Top browsers
    const browserStats = analytics.reduce(
      (acc, a) => {
        const browser = a.browser || "Unknown";
        acc[browser] = (acc[browser] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topBrowsers = Object.entries(browserStats)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    // Top referrers
    const referrerStats = analytics.reduce(
      (acc, a) => {
        const referrer = a.referer || "Direct";
        // Extract domain from referrer
        let domain = referrer;
        if (referrer && referrer !== "Direct") {
          try {
            domain = new URL(referrer).hostname;
          } catch {
            domain = referrer;
          }
        }
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topReferrers = Object.entries(referrerStats)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    // Clicks over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentAnalytics = analytics.filter(
      (a) => new Date(a.clickedAt) >= thirtyDaysAgo,
    );

    const clicksByDate = recentAnalytics.reduce(
      (acc, a) => {
        const date = new Date(a.clickedAt).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Fill missing dates with 0
    const clicksOverTime: { date: string; clicks: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      clicksOverTime.push({
        date: dateStr,
        clicks: clicksByDate[dateStr] || 0,
      });
    }

    return NextResponse.json({
      url,
      analytics: {
        totalClicks: analytics.length,
        todayClicks,
        topCountries,
        topDevices,
        topBrowsers,
        topReferrers,
        clicksOverTime,
      },
    });
  } catch (error) {
    console.error("Error fetching link analytics:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
