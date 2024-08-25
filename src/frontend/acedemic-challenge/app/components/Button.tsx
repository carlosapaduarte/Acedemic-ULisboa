import React, { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./button.module.css";

type ButtonVariant = "cut" | "round";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant: ButtonVariant;
    children: ReactNode;
}

export function Button({ variant, children, ...buttonProps }: ButtonProps) {
    return (
        <button
            {...buttonProps}
            className={`${variant === "cut" ? "cut-button" : "round-button"} ${buttonProps.className}`}
        >
            {children}
        </button>
    );
}

interface CutButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}

export function CutButton({ children, ...buttonProps }: CutButtonProps) {
    return (
        <Button
            variant="cut"
            {...buttonProps}
            children={children}
        />
    );
}

interface ConfirmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}

export function ConfirmButton({ children, ...buttonProps }: ConfirmButtonProps) {
    return (
        <CutButton
            {...buttonProps}
            className={`${styles.confirmButton} ${buttonProps.className}`}
            children={children}
        />
    );
}
