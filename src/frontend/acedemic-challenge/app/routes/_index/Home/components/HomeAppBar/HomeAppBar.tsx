import styles from "./homeAppBar.module.css";
import React from "react";
import { useTranslation } from "react-i18next";
import { useUserId } from "~/components/auth/Authn";
import { Button } from "~/components/Button";
import { useNavigate } from "@remix-run/react";

/**
 * Determines initial quote to be displayed to user, based on current time of day.
 */
function getHelloQuote(): string {
    const { t } = useTranslation();

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

function NavBarButton({ text, url }: { text: string, url: string }) {
    const navigate = useNavigate();

    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <Button variant={"cut"}
                    onClick={() => navigate(url)}
                    style={{ backgroundColor: "var(--primary)", color: "white", width: "5rem", height: "4rem"}}>Icon</Button>
            <div style={{marginTop: "0.5rem", fontSize: "0.75rem"}}>
                {text}
            </div>
        </div>
    );
}

export function HomeAppBar() {
    let helloQuote = getHelloQuote();
    const userId = useUserId();

    return (
        <div className={styles.homeAppBar}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h4 style={{ textAlign: "left", fontSize: "2rem", fontWeight: 400 }}>
                        {helloQuote}, {userId ?? "loading..."}
                    </h4>
                    <div className={`${styles.avatarContainer}`} style={{ flexShrink: 0 }}>
                        <img
                            src={"./test.webp"/*`./${userInfo.avatarFilename}`*/}
                            height="100px"
                            alt={`User's Avatar`}
                        />
                    </div>
                </div>
                <div style={{ display: "grid", gridAutoFlow: "column", marginBottom: "1rem" }}>
                    <NavBarButton text="Challenges" url={"/challenges"}/>
                    <NavBarButton text="Calendar"  url={"/calendar"}/>
                    <NavBarButton text="Badges"  url={"/badges"}/>
                </div>
            </div>
        </div>
    );
}