import { LanguageButton } from "~/components/LanguageButton/LanguageButton";
import React, { useContext, useState } from "react";
import homeAppBarStyles from "./HomeAppBar/homeAppBar.module.css";
import styles from "./appBar.module.css";
import cleanAppBarStyles from "./cleanAppBar.module.css";

import { useNavigate } from "@remix-run/react";
import { SettingsButton } from "~/components/LanguageButton/SettingsButton";
import { GreetingsContainer } from "./HomeAppBar/HomeAppBar";
import classNames from "classnames";
import { GiHamburgerMenu } from "react-icons/gi";
import { IconContext } from "react-icons";
import { AppBarContext } from "./AppBarProvider";
import { useTranslation } from "react-i18next";


function SideBarNavButton({ text, url, iconUrl, setIsSideBarOpen }: {
    text: string,
    url: string,
    iconUrl?: string,
    setIsSideBarOpen: (isOpen: boolean) => void
}) {
    const navigate = useNavigate();

    return (
        <div className={`${styles.sideBarNavButtonContainer}`}>
            <a href={url}
               onClick={(e) => {
                   e.preventDefault();
                   setIsSideBarOpen(false);
                   navigate(url);
               }}
               className={`${styles.roundButton} ${styles.sideBarNavButton}`}
            >
                <div className={styles.sideBarButtonIconContainer} aria-hidden={true}>
                    {iconUrl ?
                        <img src={iconUrl} alt=""
                             className={`${styles.sideBarNavButtonIcon}`}
                        />
                        :
                        <></>
                    }
                </div>
                <div className={`${styles.sideBarNavButtonText}`}>
                    {text}
                </div>
            </a>
        </div>
    );
}

function SideBarNavigationMenu({ setIsSideBarOpen }: { setIsSideBarOpen: (isOpen: boolean) => void }) {
    const { t } = useTranslation("navigation");

    return (
        <>
            <SideBarNavButton text={t("navigation:calendar")} url={"/calendar"} iconUrl={"icons/calendar_icon.png"}
                              setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text={t("navigation:schedule")} url={"/calendar"} iconUrl={"icons/schedule_icon.png"}
                              setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text={t("navigation:tasks")} url={"/tasks"} iconUrl={"icons/tasks_icon.png"}
                              setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text={t("navigation:notes")} url={"/archives"} iconUrl={"icons/notes_icon.png"}
                              setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text={t("navigation:study")} url={"/timer"} iconUrl={"icons/study_icon.png"}
                              setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text={t("navigation:statistics")} url={"/statistics"}
                              iconUrl={"icons/statistics_icon.png"}
                              setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text={t("navigation:badges")} url={"/badges"} iconUrl={"icons/badges_icon.png"}
                              setIsSideBarOpen={setIsSideBarOpen} />
        </>
    );
}

function SideBar() {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);

    return (
        <div data-expanded={isSideBarOpen} className={styles.sideBar}>
            <div className={styles.sideBarIconContainer}>
                <button
                    className={styles.sideBarIconButton}
                    onClick={() => setIsSideBarOpen(!isSideBarOpen)}
                    aria-expanded={isSideBarOpen}
                    aria-controls={"sidebar-content"}
                    aria-label={"Toggle sidebar"}
                >
                    <IconContext.Provider value={{ className: classNames(styles.sideBarIcon) }}>
                        <GiHamburgerMenu aria-hidden={true} />
                    </IconContext.Provider>
                </button>
            </div>
            <nav
                id={"sidebar-content"}
                aria-label="Sidebar Navigation"
                aria-hidden={!isSideBarOpen}
                className={classNames(styles.sideBarContentContainer)}
            >
                <div className={styles.sideBarContent}>
                    <SideBarNavigationMenu setIsSideBarOpen={setIsSideBarOpen} />
                </div>
            </nav>
        </div>
    );
}

export function AppBar({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) {
    const { appBarVariant } = useContext(AppBarContext);

    const { t } = useTranslation("appbar");

    const navigate = useNavigate();

    return (
        <header className={classNames(
            appBarVariant === "default" && styles.appBarContainer,
            appBarVariant === "home" && homeAppBarStyles.appBarContainer,
            appBarVariant === "clean" && cleanAppBarStyles.appBarContainer
        )}
                aria-hidden={ariaHidden}
        >
            <div className={
                classNames(
                    appBarVariant === "default" && styles.appBar,
                    appBarVariant === "home" && homeAppBarStyles.appBar,
                    appBarVariant === "clean" && cleanAppBarStyles.appBar
                )}>
                {appBarVariant !== "clean" && (
                    <button
                        aria-label={t("appbar:back")}
                        className={appBarVariant === "home" ? homeAppBarStyles.backButton : styles.backButton}
                        onClick={() => navigate(-1)}
                    >
                        {"<"}
                    </button>
                )}
                {appBarVariant === "default" && (
                    <div className={styles.homeButtonContainer}>
                        <a href={"/"}
                           aria-label={t("appbar:home")}
                           className={styles.homeButton}
                           onClick={(e) => {
                               e.preventDefault();
                               navigate("/");
                           }}>
                            <img src="/icons/home_icon.svg" alt="Home Icon" />
                        </a>
                    </div>
                )}
                <div key="settingsButtons"
                     className={appBarVariant === "home" ? homeAppBarStyles.settingsButtons : styles.settingsButtons}>
                    <SettingsButton variant={appBarVariant} />
                    <LanguageButton language={t("appbar:portugueseLanguage")} languageCode={"pt-PT"}
                                    variant={appBarVariant} />
                    <LanguageButton language={t("appbar:englishLanguage")} languageCode={"en-GB"}
                                    variant={appBarVariant} />
                </div>
                {appBarVariant === "home" && (
                    <>
                        <GreetingsContainer />
                        {/*<NavBar />*/}
                    </>
                )}
            </div>
            {appBarVariant !== "clean" &&
                <SideBar />
            }
        </header>
    );
}