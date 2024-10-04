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
    logIn: () => {
    },
    logOut: () => {
    }
});

export function AuthnContainer({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);

    function logIn() {
        setIsLoggedIn(true);
    }

    function logOut() {
        console.log("Logging out...");
        localStorage.removeItem("jwt");
        setIsLoggedIn(false);
    }

    useEffect(() => {
        async function fetchUser() {
            const jtw = localStorage["jwt"];

            if (jtw == undefined) {
                logger.debug("User is not logged in");
                setIsLoggedIn(false);
                return;
            }

            logger.debug("User has jtw stored");

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
