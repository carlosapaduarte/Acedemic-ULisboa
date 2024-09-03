import styles from "~/routes/_index/Home/components/HomeAppBar/homeAppBar.module.css";
import { CutButton } from "~/components/Button/Button";
import React from "react";


export function LanguageButton({ language }: { language: string }) {
    return <CutButton className={`${styles.languageButton} ${styles[language]}`} />;
}