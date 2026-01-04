
import { NextRequest } from "next/server";
import { verifyMessage } from "viem";

export interface AuthResult {
    isAuthenticated: boolean;
    address?: string;
    error?: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
    try {
        const signature = request.headers.get("x-auth-sig");
        const encodedMessage = request.headers.get("x-auth-msg");
        const address = request.headers.get("x-auth-address");

        if (!signature || !encodedMessage || !address) {
            return {
                isAuthenticated: false,
                error: "Missing auth headers",
            };
        }

        const message = decodeURIComponent(encodedMessage);

        // Optional: Check timestamp in message to prevent simple replay attacks
        // Ideally the message should be: "Login to PromoXchange\nTimestamp: <timestamp>"
        const timestampMatch = message.match(/Timestamp:\s*(\d+)/);
        if (!timestampMatch) {
            return {
                isAuthenticated: false,
                error: "Invalid message format",
            };
        }

        const timestamp = parseInt(timestampMatch[1]);
        const now = Date.now();
        // Allow signatures up to 24 hours old (or whatever session duration we want)
        // For now, let's say 7 days implies a "session"
        if (now - timestamp > 7 * 24 * 60 * 60 * 1000) {
            return {
                isAuthenticated: false,
                error: "Session expired",
            };
        }

        const valid = await verifyMessage({
            address: address as `0x${string}`,
            message: message,
            signature: signature as `0x${string}`,
        });

        if (!valid) {
            return {
                isAuthenticated: false,
                error: "Invalid signature",
            };
        }

        return {
            isAuthenticated: true,
            address: address.toLowerCase(),
        };
    } catch (err) {
        console.error("Auth verification error:", err);
        return {
            isAuthenticated: false,
            error: "Verification failed",
        };
    }
}
