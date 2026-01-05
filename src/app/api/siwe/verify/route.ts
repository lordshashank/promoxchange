import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { parseSiweMessage } from "viem/siwe";
import { activeChain } from "@/lib/chain";
import { createJWT, setAuthCookie, verifyNonce } from "@/lib/siwe";

export async function POST(request: NextRequest) {
    try {
        const { message, signature } = await request.json();

        if (!message || !signature) {
            return NextResponse.json(
                { error: "Missing message or signature" },
                { status: 400 }
            );
        }

        // Parse the SIWE message
        const siweMessage = parseSiweMessage(message);
        const { address, nonce, domain, uri, chainId } = siweMessage;

        if (!address || !nonce) {
            return NextResponse.json(
                { error: "Invalid SIWE message format" },
                { status: 400 }
            );
        }

        // Verify the nonce matches what we issued
        const nonceValid = await verifyNonce(nonce);
        if (!nonceValid) {
            return NextResponse.json(
                { error: "Invalid or expired nonce" },
                { status: 401 }
            );
        }

        // Verify domain matches (prevent phishing)
        const expectedDomain = request.headers.get("host") || "";
        if (domain !== expectedDomain) {
            return NextResponse.json(
                { error: "Domain mismatch" },
                { status: 401 }
            );
        }

        // Verify the signature using viem
        // Create a client for signature verification (supports smart contract wallets)
        const client = createPublicClient({
            chain: activeChain,
            transport: http(),
        });

        // For ERC-6492 smart wallet support, we use verifyMessage which handles both EOA and smart wallets
        const valid = await client.verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
        });

        if (!valid) {
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 401 }
            );
        }

        // Create JWT and set it in HTTP-only cookie
        const token = await createJWT(address);
        await setAuthCookie(token);

        return NextResponse.json({
            success: true,
            address: address.toLowerCase(),
        });
    } catch (error) {
        console.error("SIWE verification error:", error);
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 }
        );
    }
}
