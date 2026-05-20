import { LanguageButton } from "~/components/LanguageButton/LanguageButton";
import React, { useContext, useState } from "react";
import homeAppBarStyles from "./HomeAppBar/homeAppBar.module.css";
import styles from "./appBar.module.css";
import cleanAppBarStyles from "./cleanAppBar.module.css";

import { useNavigate } from "@remix-run/react";
import { SettingsButton } from "~/components/LanguageButton/SettingsButton";
import { GreetingsContainer, NavBar } from "./HomeAppBar/HomeAppBar";
import classNames from "classnames";
import { AppBarContext } from "~/components/AppBar/AppBarProvider";
import { useTranslation } from "react-i18next";

function AppSwitcher() {
  const [isTrackerActive, setIsTrackerActive] = useState(false);

  const toggleApp = () => {
    setIsTrackerActive(true);

    setTimeout(() => {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      // Manda para o Tracker
      window.location.href = isLocalhost 
        ? "http://localhost:5273/tracker/" 
        : "https://acedemic.studentlife.ulisboa.pt/tracker/";
    }, 300);
  };

  return (
    <div 
      className={styles.switcherContainer} 
      onClick={toggleApp}
      role="switch"
      aria-checked={isTrackerActive}
      title="Mudar para o Tracker"
    >
      <div 
        className={classNames(
          styles.pill, 
          isTrackerActive ? styles.pillTracker : styles.pillChallenge
        )} 
      />
      
      <div className={styles.switcherIconContainer}>
        <img 
          src="icons/logo_tracker.png"
          alt="Tracker" 
          className={classNames(
            styles.switcherLogo, 
            isTrackerActive ? styles.iconActive : styles.iconInactive
          )} 
        />
      </div>
      
      <div className={styles.switcherIconContainer}>
        <img 
          alt="Challenge" 
          className={classNames(
            styles.switcherLogo, 
            !isTrackerActive ? styles.iconActive : styles.iconInactive
          )} 
        />
      </div>
    </div>
  );
}

export function AppBar({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) {
    const { appBarVariant } = useContext(AppBarContext);

    const { t } = useTranslation("appbar");

    const navigate = useNavigate();

    return (
        <header className={
            classNames(
                appBarVariant === "default" && styles.appBar,
                appBarVariant === "home" && homeAppBarStyles.appBar,
                appBarVariant === "clean" && cleanAppBarStyles.appBar
            )}
                aria-hidden={ariaHidden}
        >
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
                        <img src="icons/home_icon.svg" alt="Home Icon" />
                    </a>
                </div>
            )}
            <div key="settingsButtons"
                 className={appBarVariant === "home" ? homeAppBarStyles.settingsButtons : styles.settingsButtons}>
                
                <div className={styles.appSwitchers}>
                  <a 
                    href="https://acedemic.studentlife.ulisboa.pt/tracker" 
                    className={styles.switcherLink}
                    title="Ir para o Study Tracker"
                  >
                    <img src="icons/calendar_icon.png" alt="Tracker" className={styles.switcherLogo} />
                  </a>
                </div>

                <LanguageButton language={t("appbar:portugueseLanguage")} languageCode={"pt-PT"} />
                <LanguageButton language={t("appbar:englishLanguage")} languageCode={"en-GB"} />
                <SettingsButton />
            </div>
            {appBarVariant === "home" && (
                <>
                    <GreetingsContainer />
                    <NavBar />
                </>
            )}
        </header>
    );
}