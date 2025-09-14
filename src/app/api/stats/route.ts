import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const totalUrls = await prisma.url.count();
    const totalClicksResult = await prisma.url.aggregate({
      _sum: { clicks: true },
    });

    const totalClicks = totalClicksResult._sum.clicks || 0;
    const averageClicks = totalUrls > 0 ? totalClicks / totalUrls : 0;

    return NextResponse.json({
      totalUrls,
      totalClicks,
      averageClicks,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
