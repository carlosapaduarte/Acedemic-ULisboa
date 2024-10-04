import React, { createContext, useContext, useEffect, useState } from "react";

export type AppBarVariant = "default" | "home" | "clean";

type AppBarContextType = {
    appBarVariant: AppBarVariant;
    setAppBarVariant: (variant: AppBarVariant) => void;
};

export const AppBarContext = createContext<AppBarContextType>({
    appBarVariant: "default",
    setAppBarVariant: (variant: AppBarVariant) => {
    }
});

export function AppBarProvider({ children }: { children: React.ReactNode }) {
    const [appBarVariant, setAppBarVariant] = useState<AppBarVariant>("default");

    return <AppBarContext.Provider value={{ appBarVariant, setAppBarVariant }}>
        {children}
    </AppBarContext.Provider>;
}

export function useAppBar(variant: AppBarVariant) {
    const { setAppBarVariant } = useContext(AppBarContext);

    useEffect(() => {
        setAppBarVariant(variant);
        return () => setAppBarVariant("default");
    }, [setAppBarVariant]);
}