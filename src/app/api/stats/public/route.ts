import { type NextRequest, NextResponse } from "next/server";
import { generateQRCode } from "@/lib/qr";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 });
    }

    const qrCode = await generateQRCode(url);

    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { message: "Failed to generate QR code" },
      { status: 500 },
    );
  }
}
