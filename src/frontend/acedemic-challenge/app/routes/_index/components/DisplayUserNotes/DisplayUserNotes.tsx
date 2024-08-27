import { UserNote } from "~/service/service";
import { t } from "i18next";
import React from "react";

export default function DisplayUserNotes({ notes, alignTitleLeft }: { notes: UserNote[], alignTitleLeft: boolean }) {
    // TODO: make this flex component have its own scroll bar instead of overflowing the main page
    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
            <h6 style={{ textAlign: alignTitleLeft ? "left" : "center" }}>
                {t("dashboard:my_notes")}
            </h6>
            <div style={{ display: "flex", flexDirection: "column", overflow: "auto", height: "100%" }}>
                {notes.length == 0 ?
                    <p style={{ textAlign: alignTitleLeft ? "left" : "center" }}>
                        {t("dashboard:no_notes")}
                    </p>
                    :
                    notes.map((note: UserNote, index: number) => {
                        const date = new Date(note.date);
                        return (
                            <div key={index} style={{ width: "100%", overflowWrap: "break-word" }}>
                                <p style={{ fontSize: "110%", textAlign: "left", fontStyle: "italic" }}>
                                    {date.getDate() + "/" + (date.getMonth() + 1 + "/" + date.getFullYear())} - {note.name}
                                </p>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}