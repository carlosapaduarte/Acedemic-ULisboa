import React, { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./button.module.css";

type ButtonVariant = "cut" | "round";

// Map variants to classes
const buttonVariantClassMap: Record<ButtonVariant, string> = {
    "cut": styles.cutButton,
    "round": styles.roundButton,
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant: ButtonVariant;
    children: ReactNode;
}

export function Button({ variant, children, ...buttonProps }: ButtonProps) {
    const buttonClass: string = buttonVariantClassMap[variant];

    return (
        <button
            {...buttonProps}
            className={`${buttonClass} ${buttonProps.className}`}
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
