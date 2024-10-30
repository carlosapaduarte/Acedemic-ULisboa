import styles from "./languageButton.module.css";
import React from "react";
import { useTranslation } from "react-i18next";
import { AppBarVariant } from "../AppBar/AppBarProvider";
import classNames from "classnames";

export function LanguageButton({ language, variant = "default" }: { language: string, variant?: AppBarVariant }) {
    const { i18n } = useTranslation();
    const selected = i18n.language.split("-")[0] === language.split("-")[0];
    return <button
        className={classNames(
            styles.languageButton,
            styles[language],
            styles[variant],
            selected && styles.selected
        )}
        onClick={() => i18n.changeLanguage(language)} />;
}