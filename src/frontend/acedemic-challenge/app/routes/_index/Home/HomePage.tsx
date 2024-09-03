import { Button } from "~/components/Button";
import { Logger } from "tslog";
import React from "react";
import { MainDashboardContent } from "./components/MainDashboardContent/MainDashboardContent";
import { useLogOut, useUserId } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import styles from "./home.module.css";
import { useTranslation } from "react-i18next";
import { HomeAppBar } from "~/routes/_index/Home/components/HomeAppBar/HomeAppBar";
import { ProgressBar } from "~/routes/_index/Home/components/ProgressBar/ProgressBar";

const logger = new Logger({ name: "HomePage" });

function ChallengeView() {
    const navigate = useNavigate();
    const userId = useUserId();
    const logOut = useLogOut();

    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "3%", overflow: "auto" }}>
            {userId
                ? <>
                    <MainDashboardContent userId={Number(userId)} />
                    <Button variant={"round"}
                            className={styles.logoutButton}
                            onClick={() => {
                                logOut();
                                navigate("/");
                            }}
                    >Log out</Button>
                </>
                : <div style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <h1>Loading...</h1>
                </div>
            }
        </div>
    );
}

export default function HomePage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
            <HomeAppBar />
            <ProgressBar />
            <ChallengeView />
        </div>
    );
}