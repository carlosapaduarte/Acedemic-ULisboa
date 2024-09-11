import { Logger } from "tslog";
import React, { useContext, useEffect } from "react";
import styles from "./homePage.module.css";
import { ProgressBar } from "~/routes/_index/Home/components/ProgressBar/ProgressBar";
import { ChallengeView } from "~/routes/_index/Home/components/ChallengeView/ChallengeView";
import { AppBarContext } from "~/components/AppBar/AppBar";

const logger = new Logger({ name: "HomePage" });

export default function HomePage() {
    const { setAppBarVariant } = useContext(AppBarContext);

    useEffect(() => {
        setAppBarVariant("home");
        return () => setAppBarVariant("default");
    }, [setAppBarVariant]);

    return (
        <div className={styles.homePage}>
            <ProgressBar />
            <ChallengeView />
        </div>
    );
}