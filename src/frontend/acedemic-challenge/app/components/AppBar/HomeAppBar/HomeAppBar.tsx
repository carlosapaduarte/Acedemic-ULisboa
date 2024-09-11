import styles from "./homeAppBar.module.css";
import React from "react";
import { useTranslation } from "react-i18next";
import { useUserId } from "~/components/auth/Authn";
import { CutButton } from "~/components/Button/Button";
import { useNavigate } from "@remix-run/react";

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

function NavBarButton({ text, url }: { text: string, url: string }) {
    const navigate = useNavigate();

    return (
        <div className={`${styles.navBarButtonContainer}`}>
            <CutButton
                onClick={() => navigate(url)}
                className={`${styles.navBarButton}`}
            >
                Icon
            </CutButton>
            <div className={`${styles.navBarButtonText}`}>
                {text}
            </div>
        </div>
    );
}

export function GreetingsContainer() {
    let helloQuote = getHelloQuote();
    const userId = useUserId();

    return (
        <div className={styles.greetingsContainer}>
            <h4 className={styles.helloQuote}>
                <span>{helloQuote}, {userId ?? "loading..."}</span>
            </h4>
            <div className={`${styles.avatarContainer}`}>
                <img
                    src={"./test.webp"/*`./${userInfo.avatarFilename}`*/}
                    height="100px"
                    alt={`User's Avatar`}
                />
            </div>
        </div>
    );
}

export function NavBar() {
    return (
        <div className={`${styles.navBar}`}>
            <NavBarButton text="Challenges" url={"/challenges"} />
            <NavBarButton text="Calendar" url={"/calendar"} />
            <NavBarButton text="Badges" url={"/badges"} />
        </div>
    );
}