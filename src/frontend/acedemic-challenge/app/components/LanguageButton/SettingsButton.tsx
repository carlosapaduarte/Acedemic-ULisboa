import { useNavigate } from "@remix-run/react";
import { IconContext } from "react-icons";
import classNames from "classnames";
import styles from "./settingsButton.module.css";
import { RiSettings5Fill } from "react-icons/ri";
import React from "react";
import { useTranslation } from "react-i18next";

export function SettingsButton() {
    const navigate = useNavigate();

    const { t } = useTranslation("appbar");

    return (
        <a href="/settings"
           aria-label={t("appbar:settings")}
           className={classNames(styles.settingsButton)}
           onClick={(e) => {
               e.preventDefault();
               navigate("/settings")
           }}>
            <IconContext.Provider value={{
                className: classNames(styles.settingsButtonIcon)
            }}>
                <RiSettings5Fill />
            </IconContext.Provider>
        </a>
    );
}