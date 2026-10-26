import * as React from "react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

export type AppNotification = {
    id: number;
    type: "success" | "error" | "info";
    message: string;
    duration?: number;
};

export type ConfirmActionOptions = {
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    danger?: boolean;
};

type ConfirmActionRequest = ConfirmActionOptions & { id: number };

type ContextType = {
    globalError: Error | undefined;
    setGlobalError: (error: Error | undefined) => void;
    notification: AppNotification | undefined;
    notify: (notification: Omit<AppNotification, "id">) => void;
    dismissNotification: () => void;
    confirmation: ConfirmActionRequest | undefined;
    confirmAction: (options: ConfirmActionOptions) => Promise<boolean>;
    resolveConfirmation: (confirmed: boolean) => void;
}
const GlobalErrorContext = createContext<ContextType>({
    globalError: undefined,
    setGlobalError: () => {},
    notification: undefined,
    notify: () => {},
    dismissNotification: () => {},
    confirmation: undefined,
    confirmAction: async () => false,
    resolveConfirmation: () => {},
});

export function GlobalErrorContainer({ children }: { children: React.ReactNode }) {
    const [globalError, setGlobalError] = useState<Error | undefined>(undefined);
    const [notification, setNotification] = useState<AppNotification | undefined>();
    const [confirmation, setConfirmation] = useState<ConfirmActionRequest | undefined>();
    const notificationId = useRef(0);
    const confirmationId = useRef(0);
    const confirmationResolver = useRef<((confirmed: boolean) => void) | null>(null);

    const notify = useCallback((nextNotification: Omit<AppNotification, "id">) => {
        notificationId.current += 1;
        setNotification({ ...nextNotification, id: notificationId.current });
    }, []);

    const dismissNotification = useCallback(() => setNotification(undefined), []);

    const confirmAction = useCallback((options: ConfirmActionOptions) => {
        confirmationResolver.current?.(false);
        confirmationId.current += 1;

        return new Promise<boolean>((resolve) => {
            confirmationResolver.current = resolve;
            setConfirmation({ ...options, id: confirmationId.current });
        });
    }, []);

    const resolveConfirmation = useCallback((confirmed: boolean) => {
        const resolve = confirmationResolver.current;
        confirmationResolver.current = null;
        setConfirmation(undefined);
        resolve?.(confirmed);
    }, []);

    return (
        <GlobalErrorContext.Provider value={{
            globalError,
            setGlobalError,
            notification,
            notify,
            dismissNotification,
            confirmation,
            confirmAction,
            resolveConfirmation,
        }}>
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

export function useAppFeedback() {
    const { notify, confirmAction } = useContext(GlobalErrorContext);
    return { notify, confirmAction };
}

export function useAppFeedbackState() {
    const { notification, dismissNotification, confirmation, resolveConfirmation } =
        useContext(GlobalErrorContext);
    return { notification, dismissNotification, confirmation, resolveConfirmation };
}
