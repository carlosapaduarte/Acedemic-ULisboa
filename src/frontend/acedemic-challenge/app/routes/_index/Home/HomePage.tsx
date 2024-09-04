import { Button } from "~/components/Button";
import { Logger } from "tslog";
import React from "react";
import MainDashboardContent from "~/routes/_index/components/MainDashboardContent/MainDashboardContent";
import { useLogOut, useUserId } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import styles from "./home.module.css";
import { useTranslation } from "react-i18next";

const logger = new Logger({ name: "HomePage" });

/**
 * Determines initial quote to be displayed to user, based on current time of day.
 */
function getHelloQuote(): string {
    const { t } = useTranslation(["hello_quote"]);
    const hourOfDay = new Date().getHours();

    switch (true) {
        case hourOfDay < 5:
            return t("hello_quote:night");
        case hourOfDay < 12:
            return t("hello_quote:morning");
        case hourOfDay < 17:
            return t("hello_quote:afternoon");
        case hourOfDay < 20:
            return t("hello_quote:evening");
        default:
            return t("hello_quote:night");
    }
}

export default function HomePage() {
    const navigate = useNavigate();
    const userId = useUserId();
    const logOut = useLogOut();
    let helloQuote = getHelloQuote();
    const { t } = useTranslation(["dashboard"]);

    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "3%" }}>
            <h3 style={{ textAlign: "left", marginBottom: "0.5%" }}>{helloQuote}, {userId ?? "loading..."}</h3>
            <h5 style={{ textAlign: "left" }}>{t("dashboard:main_message")}</h5>
            <br />
            {userId
                ? <MainDashboardContent userId={Number(userId)} />
                : <h1>Loading...</h1>
            }
            <Button variant={"round"}
                    className={styles.logoutButton}
                    onClick={() => {
                        logOut();
                        navigate("/");
                    }}
            >Log out</Button>
        </div>
    );
}