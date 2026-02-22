import * as React from "react";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from "react";
import { Logger } from "tslog";
import { service, UserInfo } from "~/service/service";

const logger = new Logger({ name: "Authn" });

type ContextType = {
    isLoggedIn: boolean | undefined;
    user: UserInfo | null;
    refreshUser: () => void;
    logIn: () => void;
    logOut: () => void;
};

const LoggedInContext = createContext<ContextType>({
    isLoggedIn: false,
    user: null,
    refreshUser: () => {},
    logIn: () => {},
    logOut: () => {},
});

export function AuthnContainer({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | undefined>(
        undefined,
    );
    const [user, setUser] = useState<UserInfo | null>(null);

    const fetchUserData = useCallback(async () => {
        try {
            const userData = await service.fetchUserInfo();
            setUser(userData as UserInfo);
            setIsLoggedIn(true);
            logger.debug("Dados do utilizador carregados com sucesso");
        } catch (error) {
            logger.error("Erro ao carregar utilizador:", error);
            logOut();
        }
    }, []);

    function logIn() {
        setIsLoggedIn(true);
        fetchUserData();
    }

    function logOut() {
        console.log("Logging out...");
        localStorage.removeItem("jwt");
        setIsLoggedIn(false);
        setUser(null);
    }

    useEffect(() => {
        async function initAuth() {
            const jwt = localStorage.getItem("jwt");

            if (!jwt) {
                logger.debug("User is not logged in (no token)");
                setIsLoggedIn(false);
                return;
            }

            logger.debug("User has token, validating...");

            // Tenta validar o token e buscar o user
            try {
                await service.testTokenValidity();

                // Se válido, buscamos os dados completos
                await fetchUserData();
            } catch (e) {
                logger.warn("Token invalid or validation failed", e);
                logOut();
            }
        }

        initAuth();
    }, [fetchUserData]);

    return (
        <LoggedInContext.Provider
            value={{
                isLoggedIn,
                user,
                refreshUser: fetchUserData,
                logIn,
                logOut,
            }}
        >
            {children}
        </LoggedInContext.Provider>
    );
}

export function useAuthn() {
    return useContext(LoggedInContext);
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
