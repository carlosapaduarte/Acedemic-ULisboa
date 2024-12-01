import React, { useEffect, useState } from "react";
import styles from "./homePage.module.css";
import { useAppBar } from "~/components/AppBar/AppBarProvider";
import { useTranslation } from "react-i18next";
import { HowMuchEnergyQuestionPage } from "./energy-question/EnergyQuestion";
import { TagsSelection } from "./energy-question/TagsSelection";

function useHomePage() {
    const [displayDailyEnergyQuestion, setDisplayDailyEnergyQuestion] = useState<boolean | undefined>(false);
    const [displayTagsSelection, setDisplayTagsSelection] = useState<boolean | undefined>(false);

    useEffect(() => {
        const promptedState = localStorage["lastEnergyQuestionPromptedDate"];
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
        setDisplayDailyEnergyQuestion(true); // TODO: remove this line. For now, showing always to fill the home page
    }, []);

    function onQuestionAnswered() {
        const today = new Date();
        localStorage["lastEnergyQuestionPromptedDate"] = today;
        /*setDisplayDailyEnergyQuestion(false);*/ // TODO: uncomment this line. For now, showing always to fill the home page
        /*setDisplayTagsSelection(true);*/
    }

    function onTagsSubmitted() {
        /*setDisplayTagsSelection(false);*/
    }

    return {
        displayDailyEnergyQuestion,
        displayTagsSelection,
        onQuestionAnswered,
        onTagsSubmitted
    };
}

export default function HomePage() {
    const { t } = useTranslation(["home"]);
    const {
        displayDailyEnergyQuestion,
        displayTagsSelection,
        onQuestionAnswered,
        onTagsSubmitted
    } = useHomePage();

    useAppBar("home");

    return (
        <div className={styles.homePage}>
            {displayDailyEnergyQuestion || displayTagsSelection ?
                displayDailyEnergyQuestion ?
                    <HowMuchEnergyQuestionPage onComplete={onQuestionAnswered} />
                    :
                    <TagsSelection onTagsSubmitted={onTagsSubmitted} />
                :
                <div>
                    {t("home:main_question")}
                </div>
            }

        </div>
    );
}