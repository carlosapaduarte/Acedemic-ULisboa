import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type SidebarSetter = (open: boolean) => void;

type TutorialContextValue = {
  preventSidebarClose: boolean;
  setPreventSidebarClose: (prevent: boolean) => void;
  registerSidebarSetter: (setter: SidebarSetter | null) => void;
  setSidebarOpen: (open: boolean) => void;
};

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [preventSidebarClose, setPreventSidebarClose] = useState(false);
  const sidebarSetterRef = useRef<SidebarSetter | null>(null);

  const registerSidebarSetter = useCallback((setter: SidebarSetter | null) => {
    sidebarSetterRef.current = setter;
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    sidebarSetterRef.current?.(open);
  }, []);

  const value = useMemo(
    () => ({
      preventSidebarClose,
      setPreventSidebarClose,
      registerSidebarSetter,
      setSidebarOpen,
    }),
    [preventSidebarClose, registerSidebarSetter, setSidebarOpen],
  );

  return (
    <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>
  );
}

export function useTutorialMenu() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorialMenu must be used within TutorialProvider");
  }
  return context;
}

/** Onboarding steps that highlight sidebar nav items (menu must stay open). */
export const ONBOARDING_MENU_NAV_STEP_START = 4;
export const ONBOARDING_MENU_NAV_STEP_END = 7;
export const ONBOARDING_HAMBURGER_STEP = 3;

export function isOnboardingMenuNavStep(stepIndex: number) {
  return (
    stepIndex >= ONBOARDING_MENU_NAV_STEP_START &&
    stepIndex <= ONBOARDING_MENU_NAV_STEP_END
  );
}
