import { Logger } from "tslog";
import React, { useEffect, useState } from "react";
import styles from "./homePage.module.css";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { useTranslation } from "react-i18next";
import { HowMuchEnergyQuestionPage } from "./EnergyQuestion";

export default function HomePage() {
    const { t } = useTranslation(["home"]);
    const [displayDailyEnergyQuestion, setDisplayDailyEnergyQuestion] = useState<boolean | undefined>(undefined)

    useAppBar("home");

    useEffect(() => {
        const prompted: Date = new Date(localStorage["lastEnergyQuestionPromptedDate"])
        const today = new Date()
        if (
            prompted == undefined ||
            today.getFullYear() > prompted.getFullYear() || 
            today.getMonth() > prompted.getMonth() ||
            today.getDay() > prompted.getDay()
        ) {
            setDisplayDailyEnergyQuestion(true)
            localStorage["lastEnergyQuestionPromptedDate"] = today
        } else
            setDisplayDailyEnergyQuestion(false)
    }, [])


    return (
        <div className={styles.homePage}>
            {displayDailyEnergyQuestion ?
                <HowMuchEnergyQuestionPage onComplete={() => setDisplayDailyEnergyQuestion(false)} />
                :
                <div>
                    {t("home:main_question")}
                </div>
            }
            
        </div>
    );
}