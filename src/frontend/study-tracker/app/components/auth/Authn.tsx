import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Logger } from "tslog";
import { service } from "~/service/service";

const logger = new Logger({ name: "Authn" });

type ContextType = {
    isLoggedIn: boolean | undefined;
    logIn: () => void;
    logOut: () => void;
};
const LoggedInContext = createContext<ContextType>({
    isLoggedIn: false,
    logIn: () => {},
    logOut: () => {}
});

export function AuthnContainer({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

    function logIn() {
        setIsLoggedIn(true);
    }

    function logOut() {
        console.log("Logging out Tracker...");
        
        // 1. Limpar as chaves do Tracker
        const keysToRemove = [
            "jwt", "token", "user",
            "tracker_jwt", "tracker_token", "tracker_user"
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));

        sessionStorage.clear();

        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/tracker/; SameSite=Lax;";
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/tracker/; SameSite=Lax;";
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;";
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax;";

        setIsLoggedIn(false);
        window.location.href = "/tracker/log-in";
    }

    useEffect(() => {
        async function fetchUser() {
            // LÊ DA GAVETA CERTA DO TRACKER
            const jwt = localStorage.getItem("tracker_jwt") || localStorage.getItem("tracker_token");

            if (!jwt) {
                logger.debug("User is not logged in");
                setIsLoggedIn(false);
                return;
            }

            logger.debug("User has tracker_jwt stored");

            service.testTokenValidity()
                .then(() => {
                    logger.debug("User is logged in");
                    setIsLoggedIn(true);
                })
                .catch(() => setIsLoggedIn(false));
        }

        fetchUser();
    }, []);

    return (
        <LoggedInContext.Provider
            value={{ isLoggedIn: isLoggedIn, logIn: logIn, logOut: logOut }}
        >
            {children}
        </LoggedInContext.Provider>
    );
}

export function useIsLoggedIn() {
    return useContext(LoggedInContext).isLoggedIn;
}

export function useLogIn() {
    return useContext(LoggedInContext).logIn;
}

export function useLogOut() {
    return useContext(LoggedInContext).logOut;
}