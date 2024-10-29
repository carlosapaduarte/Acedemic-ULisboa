import * as React from "react";
import { createContext, useContext, useState } from "react";

type ContextType = {
    globalError: Error | undefined
    setGlobalError: (error: Error | undefined) => void
}
const GlobalErrorContext = createContext<ContextType>({
    globalError: undefined,
    setGlobalError: (error: Error | undefined) => {
    }
});

export function GlobalErrorContainer({ children }: { children: React.ReactNode }) {
    const [globalError, setGlobalError] = useState<Error | undefined>(undefined);

    return (
        <GlobalErrorContext.Provider value={{ globalError: globalError, setGlobalError: setGlobalError }}>
            {children}
        </GlobalErrorContext.Provider>
    );
}

export function useGlobalError() {
    return useContext(GlobalErrorContext).globalError;
}

export function useSetGlobalError() {
    return useContext(GlobalErrorContext).setGlobalError;
}
