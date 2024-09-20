import { useNavigate } from "@remix-run/react";
import { IconContext } from "react-icons";
import classNames from "classnames";
import styles from "./settingsButton.module.css";
import { RiSettings5Fill } from "react-icons/ri";
import React from "react";
import { AppBarVariant } from "~/components/AppBar/AppBar";

export function SettingsButton({ variant = "default" }: { variant?: AppBarVariant }) {
    const navigate = useNavigate();

    return (
        <button className={classNames(styles.settingsButton)} onClick={() => navigate("/settings")}>
            <IconContext.Provider value={{
                className: classNames(styles.settingsButtonIcon, styles[variant])
            }}>
                <RiSettings5Fill />
            </IconContext.Provider>
        </button>
    );
}