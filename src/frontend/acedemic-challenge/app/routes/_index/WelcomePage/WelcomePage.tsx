import { useIsLoggedIn } from "~/components/auth/Authn";
import { useNavigate } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import styles from "~/routes/_index/WelcomePage/welcomePage.module.css";
import { CutButton } from "~/components/Button/Button";
import classNames from "classnames";
import { useAppBar } from "~/components/AppBar/AppBar";
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

function InfoPage1({ handleOnNextClick }: { handleOnNextClick: () => void }) {
    return (
        <>
            <div className={styles.studyImageContainer}>
                <img src="public/study.png" alt="A girl using her tablet"
                     className={styles.studyImage} />
            </div>
            <h1 className={styles.titleHeading}>
                Boost your study.
            </h1>
            <p className={classNames(styles.descriptionText)}>
                Lorem ipsum odor amet, consectetuer adipiscing elit. Euismod facilisis massa, sit phasellus ac sodales
                per quis. Fusce ultrices mollis fusce pellentesque est rhoncus. Condimentum taciti gravida ante lacinia
                nulla rhoncus.
            </p>
            <div className={classNames(styles.navigationContainer)}>
                <div style={{ color: "var(--secondary)" }}>
                    Placeholder
                </div>
                <CutButton className={styles.proceedButton} onClick={handleOnNextClick}>
                    Next
                </CutButton>
            </div>
        </>
    );
}

function InfoPage2({ handleOnProceedClick }: { handleOnProceedClick: () => void }) {
    return (
        <>
            <h1 className={styles.titleHeading}>
                ACE your tests!
            </h1>
            <p className={classNames(styles.descriptionText)}>
                Lorem ipsum odor amet, consectetuer adipiscing elit. Euismod facilisis massa, sit phasellus ac sodales
                per quis. Fusce ultrices mollis fusce pellentesque est rhoncus. Condimentum taciti gravida ante lacinia
                nulla rhoncus.
            </p>
            <div className={styles.studyImageContainer}>
                <img src="public/study2.png" alt="A boy writing in a paper"
                     className={styles.studyImage} />
            </div>
            <div className={classNames(styles.navigationContainer)}>
                <div style={{ color: "var(--secondary)" }}>
                    Placeholder
                </div>
                <CutButton className={styles.proceedButton} onClick={handleOnProceedClick}>
                    Next
                </CutButton>
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
            return <InfoPage2 handleOnProceedClick={handleOnProceedClick} />;
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
        <div className={classNames(styles.welcomePage)}>
            {renderInfoPage(currentPage, () => setCurrentPage(2), handleOnProceedClick)}
        </div>
    );
}