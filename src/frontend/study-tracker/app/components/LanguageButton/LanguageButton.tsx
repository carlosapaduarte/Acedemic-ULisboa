import styles from "./languageButton.module.css";
import React from "react";
import { useTranslation } from "react-i18next";
import { AppBarVariant } from "../AppBar/AppBar";
import classNames from "classnames";

export function LanguageButton({ language, variant = "default" }: { language: string, variant?: AppBarVariant }) {
    const { i18n } = useTranslation();
    return <button className={classNames(styles.languageButton, styles[language], styles[variant])}
                   onClick={() => i18n.changeLanguage(language)} />;
}