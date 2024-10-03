import * as React from 'react'
import {createContext, useContext, useState} from 'react'

type ContextType = {
    error: Error | undefined
    setError: (error: Error | undefined) => void
}
const LoggedInContext = createContext<ContextType>({
    error: undefined,
    setError: (error: Error | undefined) => {
    }
});

export function ErrorContainer({ children }: { children: React.ReactNode }) {
    const [error, setError] = useState<Error | undefined>(undefined)

    return (
        <LoggedInContext.Provider value={{ error: error, setError: setError }}>
            {children}
        </LoggedInContext.Provider>
    )
}

export function useError() {
    return useContext(LoggedInContext).error
}

export function useSetError() {
    return useContext(LoggedInContext).setError
}
