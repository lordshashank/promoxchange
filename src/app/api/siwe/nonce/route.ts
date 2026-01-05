import { NextResponse } from "next/server";
import { createNonce } from "@/lib/siwe";

export async function POST() {
    try {
        const nonce = await createNonce();
        return NextResponse.json({ nonce });
    } catch (error) {
        console.error("Nonce generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate nonce" },
            { status: 500 }
        );
    }
}
