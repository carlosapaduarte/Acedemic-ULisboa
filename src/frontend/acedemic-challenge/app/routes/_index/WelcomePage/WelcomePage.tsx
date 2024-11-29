import { useIsLoggedIn } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import styles from "~/routes/_index/WelcomePage/welcomePage.module.css";
import classNames from "classnames";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { useState } from "react";

function useWelcomePage() {
    const isLoggedIn = useIsLoggedIn();
    const navigate = useNavigate();

    const handleOnProceedClick = () => {
        if (!isLoggedIn) {
            navigate("/log-in");
        }
    };

    return { isLoggedIn, handleOnProceedClick };
}

function InfoPage1({ handleOnNextClick }: {
    handleOnNextClick: () => void
}) {
    const { t } = useTranslation(["welcome_page"]);

    return (
        <>
            <div className={styles.studyImageContainer}>
                <img src="study.png" alt="A girl using her tablet"
                     className={styles.studyImage} />
            </div>
            <h1 className={styles.titleHeading}>
                {t("welcome_page:info_page_1_title")}
            </h1>
            <p className={classNames(styles.descriptionText)}>
                {t("welcome_page:info_page_1_description")}
            </p>
            <div className={classNames(styles.navigationContainer)}>
                {/*<div style={{ color: "var(--color-2)" }}>
                    Placeholder
                </div>*/}
                {/*<button className={styles.proceedButton} onClick={handleOnPreviousClick}>
                    {t("welcome_page:previous")}
                </button>*/}
                <button className={styles.proceedButton} onClick={handleOnNextClick}>
                    {t("welcome_page:next")}
                </button>
            </div>
        </>
    );
}

function InfoPage2({ handleOnNextClick, handleOnPreviousClick }: {
    handleOnPreviousClick: () => void,
    handleOnNextClick: () => void
}) {
    const { t } = useTranslation(["welcome_page"]);

    return (
        <>
            <h1 className={styles.titleHeading}>
                {t("welcome_page:info_page_2_title")}
            </h1>
            <p className={classNames(styles.descriptionText)}>
                {t("welcome_page:info_page_2_description")}
            </p>
            <div className={styles.studyImageContainer}>
                <img src="study2.png" alt="A boy writing in a paper"
                     className={styles.studyImage} />
            </div>
            <div className={classNames(styles.navigationContainer)}>
                {/*<div style={{ color: "var(--color-2)" }}>
                    Placeholder
                </div>*/}
                <button className={styles.proceedButton} onClick={handleOnPreviousClick}>
                    {t("welcome_page:previous")}
                </button>
                <button className={styles.proceedButton} onClick={handleOnNextClick}>
                    {t("welcome_page:next")}
                </button>
            </div>
        </>
    );
}

type InfoPage = 1 | 2;

function renderInfoPage(currentPage: InfoPage, handleOnNextClick: () => void,
                        handleOnProceedClick: () => void) {
    switch (currentPage) {
        case 1:
            return <InfoPage1 handleOnNextClick={handleOnNextClick} />;
        case 2:
            return <InfoPage2 handleOnPreviousClick={() => {
            }}
                              handleOnNextClick={handleOnProceedClick} />;
    }
}

export default function WelcomePage() {
    useAppBar("clean");

    const { t } = useTranslation(["welcome_page"]);
    const { isLoggedIn, handleOnProceedClick } = useWelcomePage();

    const [currentPage, setCurrentPage] = useState<InfoPage>(1);

    if (isLoggedIn == true || isLoggedIn == undefined) {
        return null;
    }

    return (
        <div className={styles.sliderContainer}>
            <div className={classNames(styles.welcomePage, styles.first, currentPage == 1 && styles.active)}>
                <InfoPage1 handleOnNextClick={() => setCurrentPage(2)} />
            </div>
            <div className={classNames(styles.welcomePage, styles.second, currentPage == 2 && styles.active)}>
                <InfoPage2
                    handleOnPreviousClick={() => setCurrentPage(1)}
                    handleOnNextClick={handleOnProceedClick} />
            </div>
        </div>
    );
}