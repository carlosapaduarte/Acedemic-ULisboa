import styles from "./languageButton.module.css";
import React from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

export function LanguageButton({ language, languageCode }: {
    language: string, languageCode: string,
}) {
    const { i18n, t } = useTranslation();

    const selected = i18n.language.split("-")[0] === languageCode.split("-")[0];
    return <button
        aria-label={t("appbar:language", { language })}
        className={classNames(
            styles.languageButton,
            styles[languageCode],
            selected && styles.selected
        )}
        onClick={() => i18n.changeLanguage(languageCode)} />;
}