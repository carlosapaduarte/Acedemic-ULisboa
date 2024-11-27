import styles from "../home.module.css";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

function ChallengeCard() {
    const href = "/challenge";

    const { t } = useTranslation("common");

    return (
        <a
            href={href}
            className={classNames(styles.optionCard, styles.challengeCard)}
        >
            <ChallengeLogo />
            <p className={styles.challengeCardDescription}>{t("common:challenge_card_description")}</p>
        </a>
    );
}

function TrackerCard() {
    const href = "/tracker";

    const { t } = useTranslation("common");

    return (
        <a
            href={href}
            className={classNames(styles.optionCard, styles.trackerCard)}
        >
            <TrackerLogo />
            <p className={styles.trackerCardDescription}>{t("common:tracker_card_description")}</p>
        </a>
    );
}

function ChallengeLogo() {
    return (
        <div className={classNames(styles.logoContainer, styles.challengeLogoContainer)}>
            <div className={styles.acedemicTextContainer}>
                <h1 className={styles.aceText}>ACE</h1>
                <h1 className={styles.demicText}>DEMIC</h1>
            </div>
            <div className={styles.challengeAndTrophiesContainer}>
                <img src="/icons/medal_icon.svg" alt="Medal" width={50} height={50}
                     style={{ marginTop: "-5px" }} />
                <h1 className={styles.challengeText}>CHALLENGE</h1>
                <img src="/icons/trophy_icon2.svg" alt="Trophy" width={50} height={50} />
            </div>
        </div>
    );
}

function TrackerLogo() {
    return (
        <div className={classNames(styles.logoContainer, styles.trackerLogoContainer)}>
            <div className={styles.acedemicTextContainer}>
                <h1 className={styles.aceText}>ACE</h1>
                <h1 className={styles.demicText}>DEMIC</h1>
            </div>
            <div className={styles.trackerAndCheckboxContainer}>
                <h1 className={styles.trackerText}>TRACKER</h1>
                <div className={styles.checkBox} style={{ marginLeft: "0.5rem" }}>
                </div>
            </div>
        </div>
    );
}

export default function Index() {
    const { t } = useTranslation("common");
    return (
        <div className={styles.homePage}>
            <h1 className={styles.homePageTitle}>
                <span><span className={styles.homePageTitleAce}>ACE</span>demic</span>
                <span style={{marginRight: "10px"}}> </span>
                <div className={styles.homePageTitleHome}>
                    <img src="/icons/home_title_icon.svg" alt="Home" width={45} height={45} style={{marginTop: "5px", marginRight: "5px"}}/>
                    HOME
                </div>
            </h1>
            <h1 className={styles.homePageSubTitle}>{t("common:home_page_subtitle")}</h1>
            <div className={styles.optionCardsContainer}>
                <ChallengeCard />
                <TrackerCard />
            </div>
        </div>
    );
}