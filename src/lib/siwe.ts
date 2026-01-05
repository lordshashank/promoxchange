import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { generateSiweNonce } from "viem/siwe";
import { cookies } from "next/headers";

// JWT configuration
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.ENCRYPTION_SECRET
);
const JWT_EXPIRY = "7d"; // 7 days
const COOKIE_NAME = "auth_token";
const NONCE_COOKIE_NAME = "siwe_nonce";

export interface JWTPayloadData extends JWTPayload {
    sub: string; // wallet address
    iat?: number;
    exp?: number;
}

// Nonce management using cookies (stateless approach)
export async function createNonce(): Promise<string> {
    const nonce = generateSiweNonce();
    const cookieStore = await cookies();

    // Store nonce in HTTP-only cookie with 5 minute expiration
    cookieStore.set(NONCE_COOKIE_NAME, nonce, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 5 * 60, // 5 minutes
        path: "/",
    });

    return nonce;
}

export async function verifyNonce(nonce: string): Promise<boolean> {
    const cookieStore = await cookies();
    const storedNonce = cookieStore.get(NONCE_COOKIE_NAME)?.value;

    if (!storedNonce || storedNonce !== nonce) {
        return false;
    }

    // Clear nonce after verification (one-time use)
    cookieStore.delete(NONCE_COOKIE_NAME);
    return true;
}

// JWT management
export async function createJWT(address: string): Promise<string> {
    const token = await new SignJWT({ sub: address.toLowerCase() })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRY)
        .sign(JWT_SECRET);

    return token;
}

export async function verifyJWT(token: string): Promise<JWTPayloadData | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as JWTPayloadData;
    } catch {
        return null;
    }
}

export async function setAuthCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
    });
}

export async function getAuthCookie(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

export async function getAuthenticatedAddress(): Promise<string | null> {
    const token = await getAuthCookie();
    if (!token) return null;

    const payload = await verifyJWT(token);
    return payload?.sub ?? null;
}
