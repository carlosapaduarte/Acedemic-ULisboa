import { useState } from "react";
import { useTranslation } from "react-i18next";

function useSelectTime(onTimeSelected: (studyStopDate: Date, pauseStopDate: Date) => void) {
    const [studyMinutes, setStudyMinutes] = useState(25)
    const [pauseMinutes, setPauseMinutes] = useState(5)

    function onConfirmButtonClick() {
        const studyStopDate = new Date();
        studyStopDate.setMinutes(studyStopDate.getMinutes() + studyMinutes)

        const pauseStopDate = new Date(studyStopDate)
        pauseStopDate.setMinutes(pauseStopDate.getMinutes() + pauseMinutes)

        onTimeSelected(studyStopDate, pauseStopDate)
    }

    return {studyMinutes, setStudyMinutes, pauseMinutes, setPauseMinutes, onConfirmButtonClick}
}

export function SelectTime({onTimeSelected} : {onTimeSelected: (studyStopDate: Date, pauseStopDate: Date) => void}) {
    const { t } = useTranslation(["study"])
    
    const {studyMinutes, setStudyMinutes, pauseMinutes, setPauseMinutes, onConfirmButtonClick} = useSelectTime(onTimeSelected)

    return (
        <div>
            <label>
                {t("study:select_study_minutes")}
            </label>
            <input type="number" value={studyMinutes} min="0" onChange={(e) => setStudyMinutes((Number)(e.target.value))} />

            <label>
                {t("study:select_pause_minutes")}
            </label>
            <input type="number" value={pauseMinutes} min="0" onChange={(e) => setPauseMinutes((Number)(e.target.value))} />

            <button onClick={onConfirmButtonClick}>
                {t("study:confirm")}
            </button>
        </div>
    )
}