import { NextRequest, NextResponse } from "next/server";
import { extractCouponInfo } from "@/lib/gemini/vision";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("screenshot") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 }
      );
    }

    // Convert to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type;

    // Extract info via Gemini
    const extracted = await extractCouponInfo(base64, mimeType);

    return NextResponse.json({
      success: true,
      data: extracted,
    });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Extraction failed" },
      { status: 500 }
    );
  }
}
