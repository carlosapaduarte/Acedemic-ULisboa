import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { Button, Dialog, Modal, TextArea } from "react-aria-components";
import classNames from "classnames";

import "./notesModalReactAria.css";
import notesModalStyles from "./notesModal.module.css";

export function NotesModal(
    {
        batchDayNumber,
        isModalOpen,
        setIsModalOpen,
        savedNotesText,
        onNotesSave
    }: {
        batchDayNumber: number,
        isModalOpen: boolean,
        setIsModalOpen: (isOpen: boolean) => void,
        savedNotesText: string,
        onNotesSave: (notesText: string) => void
    }) {
    const { t } = useTranslation(["dashboard", "challenge_overview"]);

    const [notesText, setNotesText] = useState(savedNotesText);

    useEffect(() => {
        setNotesText(savedNotesText);
    }, [savedNotesText]);

    return (
        <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
            <Dialog aria-label={t("dashboard:notes")}>
                {({ close }) => (
                    <div className={notesModalStyles.modalContainer}>
                        <div className={notesModalStyles.modalHeader}>
                            <h1 className={notesModalStyles.modalTitle}>{t("challenge_overview:day", { day: batchDayNumber })}</h1>
                            <div className={notesModalStyles.buttonsContainer}>
                                <Button className={classNames(notesModalStyles.saveButton)}
                                        onPress={() => {
                                            onNotesSave(notesText);
                                        }}>
                                    {t("challenge_overview:save")}
                                </Button>
                                <Button className={classNames(notesModalStyles.closeButton)} onPress={close}>
                                    {t("challenge_overview:close")}
                                </Button>
                            </div>
                        </div>

                        <TextArea className={notesModalStyles.notesTextArea}
                                  value={notesText}
                                  onChange={(e) => setNotesText(e.target.value)}
                                  placeholder={t("dashboard:notes")}

                        />
                    </div>
                )}
            </Dialog>
        </Modal>
    );
}