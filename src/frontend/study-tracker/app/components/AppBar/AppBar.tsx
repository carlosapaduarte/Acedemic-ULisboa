import { LanguageButton } from "~/components/LanguageButton/LanguageButton";
import React, { createContext, useContext, useEffect, useState } from "react";
import homeAppBarStyles from "./HomeAppBar/homeAppBar.module.css";
import styles from "./appBar.module.css";
import cleanAppBarStyles from "./cleanAppBar.module.css";

import { useNavigate } from "@remix-run/react";
import { SettingsButton } from "~/components/LanguageButton/SettingsButton";
import { GreetingsContainer } from "./HomeAppBar/HomeAppBar";
import classNames from "classnames";
import { GiHamburgerMenu } from "react-icons/gi";
import { IconContext } from "react-icons";

export type AppBarVariant = "default" | "home" | "clean";

type AppBarContextType = {
    appBarVariant: AppBarVariant;
    setAppBarVariant: (variant: AppBarVariant) => void;
};

export const AppBarContext = createContext<AppBarContextType>({
    appBarVariant: "default",
    setAppBarVariant: (variant: AppBarVariant) => {
    }
});

export function AppBarProvider({ children }: { children: React.ReactNode }) {
    const [appBarVariant, setAppBarVariant] = useState<AppBarVariant>("default");

    return <AppBarContext.Provider value={{ appBarVariant, setAppBarVariant }}>
        {children}
    </AppBarContext.Provider>;
}

export function useAppBar(variant: AppBarVariant) {
    const { setAppBarVariant } = useContext(AppBarContext);

    useEffect(() => {
        setAppBarVariant(variant);
        return () => setAppBarVariant("default");
    }, [setAppBarVariant]);
}


function SideBarNavButton({ text, url, setIsSideBarOpen }: {
    text: string,
    url: string,
    setIsSideBarOpen: (isOpen: boolean) => void
}) {
    const navigate = useNavigate();

    return (
        <div className={`${styles.sideBarNavButtonContainer}`}>
            <button onClick={() => {
                setIsSideBarOpen(false);
                navigate(url);
            }}
                    className={`${styles.roundButton} ${styles.sideBarNavButton}`}
            >
                <div className={`${styles.sideBarNavButtonIcon}`}>
                    ICON
                </div>
                <div className={`${styles.sideBarNavButtonText}`}>
                    {text}
                </div>
            </button>
        </div>
    );
}

function SideBarContent({ setIsSideBarOpen }: { setIsSideBarOpen: (isOpen: boolean) => void }) {
    return (
        <>
            <SideBarNavButton text="Calendar" url={"/calendar"} setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text="Schedule" url={"/calendar"} setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text="Tasks" url={"/task-list"} setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text="Notes" url={"/archives"} setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text="Study!" url={"/timer"} setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text="Statistics" url={"/statistics"} setIsSideBarOpen={setIsSideBarOpen} />
            <SideBarNavButton text="Badges" url={"/badges"} setIsSideBarOpen={setIsSideBarOpen} />
        </>
    );
}

function SideBar() {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);

    return (
        <div aria-expanded={isSideBarOpen} className={styles.sideBar}>
            <div className={styles.sideBarIconContainer}>
                <button className={styles.sideBarIconButton} onClick={() => setIsSideBarOpen(!isSideBarOpen)}>
                    <IconContext.Provider value={{ className: classNames(styles.sideBarIcon) }}>
                        <GiHamburgerMenu />
                    </IconContext.Provider>
                </button>
            </div>
            <div aria-hidden={!isSideBarOpen} className={classNames(styles.sideBarContentContainer)}>
                <div className={styles.sideBarContent}>
                    <SideBarContent setIsSideBarOpen={setIsSideBarOpen} />
                </div>
            </div>
        </div>
    );
}

export function AppBar() {
    const { appBarVariant } = useContext(AppBarContext);

    const navigate = useNavigate();

    return (
        <div className={classNames(
            appBarVariant === "default" && styles.appBarContainer,
            appBarVariant === "home" && homeAppBarStyles.appBarContainer,
            appBarVariant === "clean" && cleanAppBarStyles.appBarContainer
        )}>
            <div className={
                classNames(
                    appBarVariant === "default" && styles.appBar,
                    appBarVariant === "home" && homeAppBarStyles.appBar,
                    appBarVariant === "clean" && cleanAppBarStyles.appBar
                )}>
                {appBarVariant !== "clean" && (
                    <button
                        className={appBarVariant === "home" ? homeAppBarStyles.backButton : styles.backButton}
                        onClick={() => navigate(-1)}
                    >
                        {"<"}
                    </button>
                )}
                {appBarVariant === "default" && (
                    <div className={styles.homeButtonContainer} onClick={() => navigate("/")}>
                        <button className={styles.homeButton}>
                            Home
                        </button>
                    </div>
                )}
                <div key="settingsButtons"
                     className={appBarVariant === "home" ? homeAppBarStyles.settingsButtons : styles.settingsButtons}>
                    <SettingsButton variant={appBarVariant} />
                    <LanguageButton language={"pt-PT"} variant={appBarVariant} />
                    <LanguageButton language={"en-GB"} variant={appBarVariant} />
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
        </div>
    );
}