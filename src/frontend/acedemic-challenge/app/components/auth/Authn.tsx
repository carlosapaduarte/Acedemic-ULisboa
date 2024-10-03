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
            // TODO: this is a solution just for now!!! Later, we won't be storing the user ID in cache
            // For now, this will ease development...
            // After Oauth, we need to think of a new solution
            const jtw = localStorage["jwt"];

            if (jtw == undefined) {
                logger.debug("User is not logged in");
                setIsLoggedIn(false);
                return;
            }

            logger.debug("User has jtw stored");
            setIsLoggedIn(true);

            // TODO: check if jwt is valid!

            service.testTokenValidity()
                .then(() => {
                    logger.debug("User is logged in");
                    setIsLoggedIn(true)
                })
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
