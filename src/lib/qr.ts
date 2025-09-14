import QRCode from "qrcode";

export async function generateQRCode(text: string): Promise<string> {
  try {
    const qrCode = await QRCode.toDataURL(text, {
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 256,
    });
    return qrCode;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}
