import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Logger } from "tslog";
import { service } from "~/service/service";
import { useSetError } from "../error/ErrorContainer";

const logger = new Logger({ name: "Authn" });
type ContextType = {
    isLoggedIn: boolean | undefined;
    logIn: (userId: number) => void;
    logOut: () => void;
};
const LoggedInContext = createContext<ContextType>({
    isLoggedIn: false,
    logIn: (userId: number) => {},
    logOut: () => {},
});

export function AuthnContainer({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);
    const setError = useSetError();

    useEffect(() => {
        async function fetchUser() {
            // TODO: this is a solution just for now!!! Later, we won't be storing the user ID in cache
            // For now, this will ease development...
            // After Oauth, we need to think of a new solution
            const cachedUserId = localStorage["userId"];
            if (cachedUserId == undefined) {
                logger.debug("User is not logged in");
                setIsLoggedIn(false);
                return;
            }
            logger.debug("User has id stored");
            await service
                .createUserOrLogin(cachedUserId) // if user ID is invalid, returns false
                .then(() => {
                    logger.debug("User is logged in");
                    setIsLoggedIn(true);
                })
                .catch((error) => setError(error));
        }

        fetchUser();
    }, []);

    function logIn(userId: number) {
        localStorage["userId"] = userId;
        setIsLoggedIn(true);
    }

    function logOut() {
        console.log("Logging out...");
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
    }

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
