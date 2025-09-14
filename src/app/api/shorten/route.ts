import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { hashPassword } from "@/lib/password";
import prisma from "@/lib/prisma";
import { formatUrl, generateShortCode } from "@/lib/utils";
import { urlSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    const body = await request.json();

    // Validate input
    const validation = urlSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0].message },
        { status: 400 },
      );
    }

    const {
      originalUrl,
      customCode,
      title,
      description,
      expiresAt,
      password,
      isPasswordProtected,
    } = validation.data;
    const formattedUrl = formatUrl(originalUrl);

    // Validate password protection
    if (isPasswordProtected && !password) {
      return NextResponse.json(
        { message: "Password is required for password-protected links" },
        { status: 400 },
      );
    }

    if (!isPasswordProtected && password) {
      return NextResponse.json(
        { message: "Cannot set password without enabling password protection" },
        { status: 400 },
      );
    }

    // Generate short code
    const shortCode = customCode || generateShortCode();

    // Check if custom code already exists
    if (customCode) {
      const existingUrl = await prisma.url.findUnique({
        where: { shortCode: customCode },
      });

      if (existingUrl) {
        return NextResponse.json(
          {
            message:
              "Custom code already exists. Please choose a different one.",
          },
          { status: 409 },
        );
      }
    }

    // Hash password if provided
    let hashedPassword: string | null = null;
    if (isPasswordProtected && password) {
      hashedPassword = await hashPassword(password);
    }

    // Create URL record
    const url = await prisma.url.create({
      data: {
        originalUrl: formattedUrl,
        shortCode,
        customCode: customCode || null,
        title: title || null,
        description: description || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        password: hashedPassword,
        isPasswordProtected: isPasswordProtected || false,
        userId: session?.user?.id || null,
      },
    });

    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${url.shortCode}`;

    return NextResponse.json({
      shortUrl,
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
      id: url.id,
      isPasswordProtected: url.isPasswordProtected,
    });
  } catch (error) {
    console.error("Error shortening URL:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
