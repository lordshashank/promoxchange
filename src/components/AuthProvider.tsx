"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { useAccount, useSignMessage, useDisconnect, useChainId } from "wagmi";
import { createSiweMessage } from "viem/siwe";

interface AuthContextType {
    isAuthenticated: boolean;
    address: string | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    isSigning: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    address: null,
    login: async () => { },
    logout: async () => { },
    isSigning: false,
    isLoading: true,
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const { address, isConnected, status, connector } = useAccount();
    const chainId = useChainId();
    const { signMessageAsync } = useSignMessage();
    const { disconnect } = useDisconnect();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authenticatedAddress, setAuthenticatedAddress] = useState<string | null>(null);
    const [isSigning, setIsSigning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCheckedSession, setHasCheckedSession] = useState(false);

    // Check existing session on mount and address change
    const checkSession = useCallback(async () => {
        try {
            const response = await fetch("/api/me", {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.authenticated && data.address) {
                    // Only set as authenticated if the server address matches the connected address
                    if (address && data.address.toLowerCase() === address.toLowerCase()) {
                        setIsAuthenticated(true);
                        setAuthenticatedAddress(data.address);
                        return true;
                    }
                }
            }
        } catch (error) {
            console.error("Session check failed:", error);
        }

        // Only clear authentication state if the wallet is settled and definitely doesn't match
        if (status !== "connecting" && status !== "reconnecting") {
            setIsAuthenticated(false);
            setAuthenticatedAddress(null);
        }
        return false;
    }, [address, status]);

    useEffect(() => {
        // Wait for connection to settle before doing the initial session check
        if (status === "connecting" || status === "reconnecting") return;

        const init = async () => {
            setIsLoading(true);
            await checkSession();
            setIsLoading(false);
            setHasCheckedSession(true);
        };
        init();
    }, [checkSession, status]);

    // Handle wallet disconnection and address changes
    useEffect(() => {
        const handleAuthInvalidation = async () => {
            // Wait for reconnection to settle before deciding to log out
            if (status === "connecting" || status === "reconnecting") return;

            const isDisconnected = status === "disconnected";
            const addressChanged = address && authenticatedAddress &&
                address.toLowerCase() !== authenticatedAddress.toLowerCase();

            if (isAuthenticated && (isDisconnected || addressChanged)) {
                try {
                    await fetch("/api/siwe/logout", {
                        method: "POST",
                        credentials: "include",
                    });
                } catch (error) {
                    console.error("Auto-logout failed:", error);
                }
                setIsAuthenticated(false);
                setAuthenticatedAddress(null);
            }
        };

        handleAuthInvalidation();
    }, [status, address, authenticatedAddress, isAuthenticated]);

    const login = async () => {
        if (!address) return;

        setIsSigning(true);
        try {
            // 1. Get nonce from server
            const nonceResponse = await fetch("/api/siwe/nonce", {
                method: "POST",
                credentials: "include",
            });

            if (!nonceResponse.ok) {
                throw new Error("Failed to get nonce");
            }

            const { nonce } = await nonceResponse.json();

            // 2. Create SIWE message
            const message = createSiweMessage({
                address,
                chainId,
                domain: window.location.host,
                nonce,
                uri: window.location.origin,
                version: "1",
                statement: "Sign in to PromoXchange. This signature creates a session without costing any gas.",
            });

            // 3. Sign the message
            const signature = await signMessageAsync({ message });

            // 4. Verify signature with server
            const verifyResponse = await fetch("/api/siwe/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message, signature }),
                credentials: "include",
            });

            if (!verifyResponse.ok) {
                const error = await verifyResponse.json();
                throw new Error(error.error || "Verification failed");
            }

            const result = await verifyResponse.json();

            if (result.success) {
                setIsAuthenticated(true);
                setAuthenticatedAddress(result.address);
            }
        } catch (error) {
            console.error("SIWE login failed:", error);
        } finally {
            setIsSigning(false);
        }
    };
    // not used as of now anywhere as we handle it in useeffect
    const logout = async () => {
        try {
            await fetch("/api/siwe/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout API call failed:", error);
        }

        setIsAuthenticated(false);
        setAuthenticatedAddress(null);
        disconnect();
    };

    // Auto-prompt login if connected but not authenticated
    useEffect(() => {
        // Skip auto-login for Porto connector as it has issues with auto-popups getting stuck
        const isPorto = connector?.id === "porto" || connector?.id === "xyz.ithaca.porto";

        if (
            isConnected &&
            address &&
            !isAuthenticated &&
            !isSigning &&
            !isLoading &&
            hasCheckedSession &&
            !isPorto
        ) {
            // Small delay to allow UI to settle
            const timeout = setTimeout(() => {
                login();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [isConnected, address, isAuthenticated, isLoading, hasCheckedSession, connector?.id]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                address: authenticatedAddress,
                login,
                logout,
                isSigning,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
