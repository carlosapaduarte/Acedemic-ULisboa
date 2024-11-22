import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer"
import { service } from "~/service/service"

const questions = {
    "Dormir": [
        "dormir cedo",
        "dormir bem",
        "dormir mais ou menos",
        "dormir mal"
    ],
    "Social": [
        "familia",
        "amigos",
        "encontro",
        "festa"
    ],
    "Passatempo": []
}

function Option({option, onOptionSelected} : {option: string, onOptionSelected: () => void}) {
    return (
        <span onClick={onOptionSelected}>
            {option}
        </span>
    )
}

// Iterates across options
function Options({type, options, onOptionSelected} : {type: string, options: string[], onOptionSelected: (opt: string) => void}) {
    return (
        <>
            <h2>
                Type: {type}
            </h2>
            {options.map((option: string, index: number) => 
                <Option key={index} option={option} onOptionSelected={() => onOptionSelected(option)} />
            )}
        </>
    )
}

function QuestionsContainer({onOptionSelected} : {onOptionSelected: (opt: string) => void}) {
    return (
        // Iterates across types
        Object.entries(questions).map((entry, index: number) => {
            const type: string = entry[0]
            const options: string[] = entry[1]
            return (
                <>
                    <Options 
                        key={index} 
                        type={type} 
                        options={options} 
                        onOptionSelected={onOptionSelected}
                    />
                    <br/>
                </>
            )
        })
    )
}

function Title() {
    const { t } = useTranslation(["statistics"]);
    return (
        <span>
            {t("statistics:what_have_you_done_lately")}
        </span>
    )
}

function useTagsSelection() {
    const setError = useSetGlobalError();
    const tags: string[] = []

    function appendTag(tag: string) {
        if (!tags.includes(tag))
            tags.push(tag)
    }
    
    function submitTags(onTagsSubmitted: () => void) {
        service.submitDailyTags(tags)
            .then(() => onTagsSubmitted)
            .catch((error) => setError(error));
    }

    return {
        appendTag,
        submitTags
    }
}

export function TagsSelection({onTagsSubmitted} : {onTagsSubmitted: () => void}) {
    const {
        appendTag,
        submitTags
    } = useTagsSelection()
    return (
        <>
            <Title />
            <br/>
            
            <QuestionsContainer onOptionSelected={appendTag} />

            <br/>
            
            <button onClick={() => submitTags(onTagsSubmitted)}>
                Confirm Selection
            </button>
        </>
    )
}