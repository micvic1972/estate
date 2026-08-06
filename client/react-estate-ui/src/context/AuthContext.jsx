import { createContext, useEffect, useState } from "react";
import apiRequest from "../lib/apiRequest";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
    // Starts as null — we don't know who's logged in until we ask the server.
    const [currentUser, setCurrentUser] = useState(null);

    // True while we're checking with the server. Navbar/Profile/anything
    // that depends on currentUser should wait for this to be false before
    // deciding "show logged-out UI" — otherwise there's a flash of the
    // wrong screen on every page refresh.
    const [isLoading, setIsLoading] = useState(true);

    // On first load (and only then — empty dependency array), ask the
    // server who the httpOnly cookie belongs to. The cookie is sent
    // automatically by the browser; we never touch it in JS.
    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const res = await apiRequest.get("/auth/me");
                setCurrentUser(res.data.user);
            } catch (err) {
                // No valid session — that's a normal, expected case,
                // not an error to log loudly.
                setCurrentUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadCurrentUser();
    }, []);

    // Called by Login.jsx and Register.jsx right after a successful
    // login/registration, so the app updates immediately without
    // waiting for another round-trip to /auth/me.
    const updateUser = (data) => {
        setCurrentUser(data);
    };

    // Called by a logout button anywhere in the app.
    const logout = async () => {
        try {
            await apiRequest.post("/auth/logout");
        } finally {
            setCurrentUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, updateUser, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};