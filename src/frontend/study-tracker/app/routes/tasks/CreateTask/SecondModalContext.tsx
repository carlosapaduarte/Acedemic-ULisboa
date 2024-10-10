import { createContext } from "react";

type ContextType = {
    isSecondModalOpen: boolean,
    setIsSecondModalOpen: (isSecondModalOpen: boolean) => void,
    secondModalContent: JSX.Element | undefined,
    setSecondModalContent: (content: JSX.Element) => void,
    secondModalClass: string | undefined,
    setSecondModalClass: (className: string) => void
};
export const SecondModalContext = createContext<ContextType>({
    isSecondModalOpen: false,
    setIsSecondModalOpen: () => {
    },
    secondModalContent: undefined,
    setSecondModalContent: () => {
    },
    secondModalClass: undefined,
    setSecondModalClass: () => {
    }
});