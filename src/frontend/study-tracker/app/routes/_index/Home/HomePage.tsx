import { Logger } from "tslog";
import React from "react";
import styles from "./homePage.module.css";
import { useAppBar } from "~/components/AppBar/AppBar";

const logger = new Logger({ name: "HomePage" });

export default function HomePage() {
    useAppBar("home");

    return (
        <div className={styles.homePage}>
            <div>
                What do I want to do this week?
            </div>
        </div>
    );
}