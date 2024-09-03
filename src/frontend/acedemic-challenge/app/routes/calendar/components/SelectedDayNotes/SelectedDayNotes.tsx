import { UserNote } from "~/service/service";
import React, { useState } from "react";
import { utils } from "~/utils";
import DisplayUserNotes from "~/routes/_index/Home/components/DisplayUserNotes/DisplayUserNotes";

function useSelectedDayNotes({ selectedDate, userNotes, onConfirmNewNoteSubmitClickHandler }: {
    selectedDate: Date,
    userNotes: UserNote[]
    onConfirmNewNoteSubmitClickHandler: (noteText: string) => void
}) {
    const [newNoteText, setNewNoteText] = useState("");

    // Filters today's notes
    const userNotesToDisplay: UserNote[] = userNotes.filter((note: UserNote) => utils.sameDay(new Date(note.date * 1000), selectedDate));

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // For now, this new goal will be associated to a challenge day, for simplification

        if (event.key === "Enter") {
            onConfirmNewNoteSubmitClickHandler(newNoteText);
        }
    };

    function onNewNoteSubmitClickHandler() {
        onConfirmNewNoteSubmitClickHandler(newNoteText);
    }

    return { newNoteText, setNewNoteText, userNotesToDisplay, handleKeyPress, onNewNoteSubmitClickHandler };
}

export default function SelectedDayNotes(
    { selectedDate, userNotes, onConfirmNewNoteSubmitClickHandler }: {
        selectedDate: Date,
        userNotes: UserNote[]
        onConfirmNewNoteSubmitClickHandler: (noteText: string) => void
    }
) {
    const {
        newNoteText,
        setNewNoteText,
        userNotesToDisplay,
        handleKeyPress,
        onNewNoteSubmitClickHandler
    } = useSelectedDayNotes({ selectedDate, userNotes, onConfirmNewNoteSubmitClickHandler });

    return (
        <div style={{ width: "100%" }}>
            {/*<TextField
                sx={{marginBottom: '2%', width: "100%"}}
                id="outlined-controlled"
                label={t("calendar:new_note_label")}
                value={newNoteText}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setNewNoteText(event.target.value)
                }}
                onKeyDown={handleKeyPress}
            />
            <Button variant="contained" sx={{width: '100%'}}
                    onClick={onNewNoteSubmitClickHandler}>
                {t("dashboard:confirm_new_note")}
            </Button>*/}

            <DisplayUserNotes notes={userNotesToDisplay} alignTitleLeft={false} />
        </div>
    );
}