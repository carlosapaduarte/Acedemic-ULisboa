import styles from "~/routes/_index/Home/components/HomeAppBar/homeAppBar.module.css";
import { CutButton } from "~/components/Button/Button";
import React from "react";
import { useTranslation } from "react-i18next";


export function LanguageButton({ language }: { language: string }) {
    const { i18n } = useTranslation();
    return <CutButton className={`${styles.languageButton} ${styles[language]}`}
                      onClick={() => i18n.changeLanguage(language)} />;
}