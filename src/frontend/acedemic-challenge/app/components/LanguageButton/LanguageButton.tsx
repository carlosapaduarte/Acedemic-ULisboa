import styles from "./languageButton.module.css";
import { CutButton } from "../Button/Button";
import React from "react";
import { useTranslation } from "react-i18next";

export function LanguageButton({ language }: { language: string }) {
    const { i18n } = useTranslation();
    return <button className={`${styles.languageButton} ${styles[language]}`}
                      onClick={() => i18n.changeLanguage(language)} />;
}