import React, { useEffect, useState } from "react";
import styles from "./homePage.module.css";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { useTranslation } from "react-i18next";
import HowMuchEnergyQuestionPage from "~/routes/energy-question/route";

function useHomePage() {
    const [displayDailyEnergyQuestion, setDisplayDailyEnergyQuestion] = useState<boolean | undefined>(false);

    useEffect(() => {
        const promptedState = localStorage["lastEnergyQuestionPromptedDate"]
        const prompted: Date | undefined = promptedState ? new Date(promptedState) : undefined;
        const today = new Date();
        if (
            prompted == undefined ||
            today.getFullYear() > prompted.getFullYear() ||
            today.getMonth() > prompted.getMonth() ||
            today.getDay() > prompted.getDay()
        ) {
            setDisplayDailyEnergyQuestion(true);
        }
    }, []);

    function onQuestionAnswered() {
        const today = new Date();
        localStorage["lastEnergyQuestionPromptedDate"] = today;
        setDisplayDailyEnergyQuestion(false)
    }

    return {
        displayDailyEnergyQuestion,
        onQuestionAnswered
    }
}

export default function HomePage() {
    const { t } = useTranslation(["home"]);
    const {
        displayDailyEnergyQuestion,
        onQuestionAnswered
    } = useHomePage()

    useAppBar("home");    

    return (
        <div className={styles.homePage}>
            {displayDailyEnergyQuestion ?
                <HowMuchEnergyQuestionPage onComplete={onQuestionAnswered} />
                :
                <div>
                    {t("home:main_question")}
                </div>
            }

        </div>
    );
}