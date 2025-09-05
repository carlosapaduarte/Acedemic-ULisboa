import styles from "./homeAppBar.module.css";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "@remix-run/react";
import { service, UserInfo } from "~/service/service";

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

function NavBarButton({
    text,
    url,
    iconSrc,
}: {
    text: string;
    url: string;
    iconSrc?: string;
}) {
    const navigate = useNavigate();

    return (
        <div className={`${styles.navBarButtonContainer}`}>
            <a
                href={url}
                onClick={(e) => {
                    e.preventDefault();
                    navigate(url);
                }}
                className={`${styles.navBarButton}`}
            >
                {iconSrc ? <img src={iconSrc} alt={text} /> : text}
            </a>
            <div className={`${styles.navBarButtonText}`} aria-hidden="true">
                {text}
            </div>
        </div>
    );
}

export function GreetingsContainer() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const fetchAppBarData = () => {
        service.fetchUserInfoFromApi().then((fetchedUserInfo: UserInfo) => {
            setUserInfo(fetchedUserInfo);
        });
    };

    useEffect(() => {
        fetchAppBarData();

        window.addEventListener("updateAppBar", fetchAppBarData);
        return () => {
            window.removeEventListener("updateAppBar", fetchAppBarData);
        };
    }, []);

    const helloQuote = getHelloQuote();

    return (
        <div className={styles.greetingsContainer}>
            <div className={styles.greetingTextContainer}>
                <h4 className={styles.helloQuote}>
                    {userInfo ? (
                        <>
                            <span>
                                {helloQuote}, {userInfo.username}
                            </span>
                            {typeof userInfo.currentChallengeLevel ===
                                "number" && (
                                <p className={styles.levelText}>
                                    {userInfo.currentChallengeLevel === 1 &&
                                        "Nível: Pouco Eficaz"}
                                    {userInfo.currentChallengeLevel === 2 &&
                                        "Nível: Eficaz"}
                                    {userInfo.currentChallengeLevel === 3 &&
                                        "Nível: Muito Eficaz"}
                                </p>
                            )}
                        </>
                    ) : (
                        <span>Loading...</span>
                    )}
                </h4>
            </div>
            <div className={`${styles.avatarAndDropdownContainer}`}>
                <div className={`${styles.avatarContainer}`}>
                    <img
                        width={92}
                        height={92}
                        src={`${userInfo?.avatarFilename || ""}`}
                        alt={`User's Avatar`}
                    />
                </div>
            </div>
        </div>
    );
}

export function NavBar() {
    const { t } = useTranslation(["appbar"]);

    return (
        <div className={`${styles.navBar}`}>
            <NavBarButton
                text={t("appbar:nav_bar_challenges")}
                url={"/challenges"}
                iconSrc={"icons/challenges_icon.svg"}
            />
            <NavBarButton
                text={t("appbar:nav_bar_calendar")}
                url={"/calendar"}
                iconSrc={"icons/calendar_icon.svg"}
            />
            <NavBarButton
                text={t("appbar:nav_bar_badges")}
                url={"/badges"}
                iconSrc={"icons/badges_icon.svg"}
            />
        </div>
    );
}
