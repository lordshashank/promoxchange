"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    message: string | null;
    login: () => Promise<void>;
    logout: () => void;
    getAuthHeaders: () => Record<string, string>;
    isSigning: boolean;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    token: null,
    message: null,
    login: async () => { },
    logout: () => { },
    getAuthHeaders: () => ({}),
    isSigning: false,
});

export function useAuth() {
    return useContext(AuthContext);
}

const STORAGE_KEY_PREFIX = "promoxchange_auth_";

export function AuthProvider({ children }: { children: ReactNode }) {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { disconnect } = useDisconnect();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [isSigning, setIsSigning] = useState(false);

    // Load state from local storage on mount/address change
    useEffect(() => {
        if (!address) {
            setIsAuthenticated(false);
            setToken(null);
            setMessage(null);
            return;
        }

        const saved = localStorage.getItem(STORAGE_KEY_PREFIX + address);
        if (saved) {
            try {
                const { sig, msg, timestamp } = JSON.parse(saved);
                // basic expiry check (7 days)
                if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
                    setToken(sig);
                    setMessage(msg);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem(STORAGE_KEY_PREFIX + address);
                }
            } catch (e) {
                console.error("Failed to parse auth", e);
            }
        }
    }, [address]);

    const login = async () => {
        if (!address) return;

        setIsSigning(true);
        try {
            const timestamp = Date.now();
            const msg = `Welcome to PromoXchange!

To verify that you own this wallet, please sign this message.
This signature creates a session without costing any gas.

Website: ${window.location.origin}
Wallet: ${address}
Timestamp: ${timestamp}`;

            const sig = await signMessageAsync({ message: msg });

            const authData = { sig, msg, timestamp };
            localStorage.setItem(STORAGE_KEY_PREFIX + address, JSON.stringify(authData));

            setToken(sig);
            setMessage(msg);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Signing failed", error);
            // Optional: disconnect if they refuse to sign?
            // disconnect(); 
        } finally {
            setIsSigning(false);
        }
    };

    const logout = () => {
        if (address) {
            localStorage.removeItem(STORAGE_KEY_PREFIX + address);
        }
        setToken(null);
        setMessage(null);
        setIsAuthenticated(false);
        disconnect();
    };

    // Auto-prompt login if connected but not authenticated
    useEffect(() => {
        if (isConnected && address && !isAuthenticated && !isSigning && !token) {
            // one second timeout
            setTimeout(() => {
                login();
            }, 1000);
        }
    }, [isConnected, address, isAuthenticated, token]);

    const getAuthHeaders = (): Record<string, string> => {
        if (!token || !message || !address) return {};
        // Headers cannot contain newlines, so we encode the message
        return {
            "x-auth-sig": token,
            "x-auth-msg": encodeURIComponent(message),
            "x-auth-address": address,
        };
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                token,
                message,
                login,
                logout,
                getAuthHeaders,
                isSigning,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
