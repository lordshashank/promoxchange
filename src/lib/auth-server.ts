
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT, type JWTPayloadData } from "./siwe";

export interface AuthResult {
    isAuthenticated: boolean;
    address?: string;
    error?: string;
}

const AUTH_COOKIE_NAME = "auth_token";

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
    try {
        // Get auth token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

        if (!token) {
            return {
                isAuthenticated: false,
                error: "No authentication token",
            };
        }

        // Verify JWT
        const payload = await verifyJWT(token);

        if (!payload) {
            return {
                isAuthenticated: false,
                error: "Invalid or expired token",
            };
        }

        // Check expiration
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return {
                isAuthenticated: false,
                error: "Session expired",
            };
        }

        return {
            isAuthenticated: true,
            address: payload.sub?.toLowerCase(),
        };
    } catch (err) {
        console.error("Auth verification error:", err);
        return {
            isAuthenticated: false,
            error: "Verification failed",
        };
    }
}
