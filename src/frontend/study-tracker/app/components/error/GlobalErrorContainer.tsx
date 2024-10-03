import * as React from "react";
import { createContext, useContext, useState } from "react";

type ContextType = {
    globalError: Error | undefined
    setGlobalError: (error: Error | undefined) => void
}
const LoggedInContext = createContext<ContextType>({
    globalError: undefined,
    setGlobalError: (error: Error | undefined) => {
    }
});

export function GlobalErrorContainer({ children }: { children: React.ReactNode }) {
    const [globalError, setGlobalError] = useState<Error | undefined>(undefined);

    return (
        <LoggedInContext.Provider value={{ globalError: globalError, setGlobalError: setGlobalError }}>
            {children}
        </LoggedInContext.Provider>
    );
}

export function useGlobalError() {
    return useContext(LoggedInContext).globalError;
}

export function useSetGlobalError() {
    return useContext(LoggedInContext).setGlobalError;
}
