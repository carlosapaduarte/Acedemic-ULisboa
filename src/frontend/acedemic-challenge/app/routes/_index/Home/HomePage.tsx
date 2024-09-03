import { Logger } from "tslog";
import React from "react";
import styles from "./homePage.module.css";
import { HomeAppBar } from "~/routes/_index/Home/components/HomeAppBar/HomeAppBar";
import { ProgressBar } from "~/routes/_index/Home/components/ProgressBar/ProgressBar";
import { ChallengeView } from "~/routes/_index/Home/components/ChallengeView/ChallengeView";

const logger = new Logger({ name: "HomePage" });

export default function HomePage() {
    return (
        <div className={styles.homePage}>
            <HomeAppBar />
            <ProgressBar />
            <ChallengeView />
        </div>
    );
}