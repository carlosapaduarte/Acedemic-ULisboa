import { useNavigate } from "@remix-run/react";
import { IconContext } from "react-icons";
import classNames from "classnames";
import styles from "./settingsButton.module.css";
import { RiSettings5Fill } from "react-icons/ri";
import React from "react";
import { AppBarVariant } from "~/components/AppBar/AppBarProvider";
import { useTranslation } from "react-i18next";

export function SettingsButton({ variant = "default" }: { variant?: AppBarVariant }) {
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
                className: classNames(styles.settingsButtonIcon, styles[variant])
            }}>
                <RiSettings5Fill />
            </IconContext.Provider>
        </a>
    );
}