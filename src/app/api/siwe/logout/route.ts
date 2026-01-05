import { NextResponse } from "next/server";
import { clearAuthCookie, getAuthCookie } from "@/lib/siwe";

export async function POST() {
    try {
        const token = await getAuthCookie();

        if (!token) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            );
        }

        await clearAuthCookie();

        return NextResponse.json({ success: true, message: "Logged out" });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "Logout failed" },
            { status: 500 }
        );
    }
}
