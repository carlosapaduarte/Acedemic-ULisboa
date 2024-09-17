import React, { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./button.module.css";

type ButtonVariant = "cut" | "round" | "none";

// Map variants to classes
const buttonVariantClassMap: Record<ButtonVariant, string> = {
    "cut": styles.cutButton,
    "round": styles.roundButton,
    "none": ""
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    children?: ReactNode;
}

export function Button({ variant = "none", children, ...buttonProps }: ButtonProps) {
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
    children?: ReactNode;
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
