import { Logger } from "tslog";
import React from "react";
import styles from "./homePage.module.css";
import { ProgressBar } from "~/routes/_index/Home/components/ProgressBar/ProgressBar";
import { ChallengeView } from "~/routes/_index/Home/components/ChallengeView/ChallengeView";
import { useAppBar } from "~/components/AppBar/AppBar";

const logger = new Logger({ name: "HomePage" });

export default function HomePage() {
    useAppBar("home");

    return (
        <div className={styles.homePage}>
            <ProgressBar />
            <ChallengeView />
        </div>
    );
}