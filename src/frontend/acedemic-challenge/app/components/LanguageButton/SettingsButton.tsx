import { useNavigate } from "@remix-run/react";
import { IconContext } from "react-icons";
import classNames from "classnames";
import styles from "./settingsButton.module.css";
import { RiSettings5Fill } from "react-icons/ri";
import React from "react";

export function SettingsButton() {
    const navigate = useNavigate();

    return <IconContext.Provider value={{ className: classNames(styles.settingsButton) }}>
        <RiSettings5Fill onClick={() => navigate("/settings")} />
    </IconContext.Provider>;
}