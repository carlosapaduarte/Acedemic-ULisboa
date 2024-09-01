import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Logger } from "tslog";
import { service } from "~/service/service";
import { useSetError } from "../error/ErrorContainer";

const logger = new Logger({ name: "Authn" });
type ContextType = {
    isLoggedIn: boolean | undefined;
    userId: number | undefined;
    logIn: (userId: number) => void;
    logOut: () => void;
};
const LoggedInContext = createContext<ContextType>({
    isLoggedIn: false,
    userId: undefined,
    logIn: (userId: number) => {
    },
    logOut: () => {
    }
});

export function AuthnContainer({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(undefined);
    const [userId, setUserId] = useState<number | undefined>(undefined);
    const setError = useSetError();

    function logIn(newUserId: number) {
        setUserId(newUserId);
        setIsLoggedIn(true);
        localStorage["userId"] = newUserId;
    }

    function logOut() {
        console.log("Logging out...");
        setUserId(undefined);
        setIsLoggedIn(false);
        localStorage.removeItem("userId");
    }

    useEffect(() => {
        async function fetchUser() {
            // TODO: this is a solution just for now!!! Later, we won't be storing the user ID in cache
            // For now, this will ease development...
            // After Oauth, we need to think of a new solution
            const storedUserId = localStorage["userId"];

            if (storedUserId == undefined) {
                logger.debug("User is not logged in");
                setIsLoggedIn(false);
                return;
            }

            logger.debug("User has id stored");
            setUserId(Number(storedUserId));

            await service
                .createUserOrLogin(storedUserId) // if user ID is invalid, returns false
                .then(() => {
                    logger.debug("User is logged in");
                    setIsLoggedIn(true);
                })
                .catch((error) => setError(error));
        }

        fetchUser();
    }, []);

    return (
        <LoggedInContext.Provider
            value={{ isLoggedIn: isLoggedIn, userId: userId, logIn: logIn, logOut: logOut }}
        >
            {children}
        </LoggedInContext.Provider>
    );
}

export function useIsLoggedIn() {
    return useContext(LoggedInContext).isLoggedIn;
}

export function useUserId() {
    return useContext(LoggedInContext).userId;
}

export function useLogIn() {
    return useContext(LoggedInContext).logIn;
}

export function useLogOut() {
    return useContext(LoggedInContext).logOut;
}
