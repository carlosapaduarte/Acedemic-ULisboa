import * as React from 'react'
import {createContext, useContext, useEffect, useState} from 'react'
import {Logger} from "tslog";

const logger = new Logger({ name: "Authn" });
type ContextType = {
    logged: boolean | undefined
    setLogged: (logged: boolean) => void
}
const LoggedInContext = createContext<ContextType>({
    logged: false,
    setLogged: (logged: boolean ) => {  }
})

export function AuthnContainer({ children }: { children: React.ReactNode }) {
    const [logged, setLogged] = useState<boolean | undefined>(undefined)

    return (
        <LoggedInContext.Provider value={{ logged: logged, setLogged: setLogged }}>
            {children}
        </LoggedInContext.Provider>
    )
}

export function useIsLoggedIn() {
    return useContext(LoggedInContext).logged
}

export function useSetIsLoggedIn() {
    return useContext(LoggedInContext).setLogged
}