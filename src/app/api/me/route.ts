import { NextResponse } from "next/server";
import { getAuthenticatedAddress } from "@/lib/siwe";

export async function GET() {
    try {
        const address = await getAuthenticatedAddress();

        if (!address) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            authenticated: true,
            address,
        });
    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json(
            { error: "Authentication check failed" },
            { status: 500 }
        );
    }
}
