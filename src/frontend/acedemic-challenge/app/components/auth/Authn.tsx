import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { Logger } from "tslog";
import { service } from "~/service/service";
import { useSetError } from "../error/ErrorContainer";

const logger = new Logger({ name: "Authn" });
type ContextType = {
    logged: boolean | undefined;
    setLogged: (logged: boolean) => void;
};
const LoggedInContext = createContext<ContextType>({
    logged: false,
    setLogged: (logged: boolean) => {},
});

export function AuthnContainer({ children }: { children: React.ReactNode }) {
    const [logged, setLogged] = useState<boolean | undefined>(undefined);
    const setError = useSetError();

    useEffect(() => {
        async function fetchUser() {
            // TODO: this is a solution just for now!!! Later, we won't be storing the user ID in cache
            // For now, this will ease development...
            // After Oauth, we need to think of a new solution
            const cachedUserId = localStorage["userId"];
            if (cachedUserId == undefined) {
                logger.debug("User is not logged in");
                setLogged(false);
                return;
            }
            logger.debug("User has id stored");
            await service
                .createUserOrLogin(cachedUserId) // if user ID is invalid, returns false
                .then(() => {
                    logger.debug("User is logged in");
                    setLogged(true);
                })
                .catch((error) => setError(error));
        }

        fetchUser();
    }, []);

    return (
        <LoggedInContext.Provider
            value={{ logged: logged, setLogged: setLogged }}
        >
            {children}
        </LoggedInContext.Provider>
    );
}

export function useIsLoggedIn() {
    return useContext(LoggedInContext).logged;
}

export function useSetIsLoggedIn() {
    return useContext(LoggedInContext).setLogged;
}
