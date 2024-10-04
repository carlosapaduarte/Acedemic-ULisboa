import { Button, Dialog, Input, Label, Modal, TextField } from "react-aria-components";
import classNames from "classnames";
import "./createEventReactAriaModal.css";
import styles from "./createEvent.module.css";
import React, { useState } from "react";
import { service } from "~/service/service";

const possibleTags = [
    "study",
    "work",
    "personal",
    "fun"
];

const TitleSection = React.memo(function TitleSection({ title, setTitle }: {
    title: string | undefined,
    setTitle: (title: string) => void
}) {
    return (
        <div className={styles.titleSectionContainer}>
            <TextField autoFocus>
                <Label className={styles.formSectionTitle}>Title</Label>
                <Input className={styles.formInput}
                       required
                       value={title}
                       onChange={
                           (e) => setTitle(e.target.value)
                       } />
            </TextField>
        </div>
    );
});

const TagSection = React.memo(function TagSection({ selectedTags, setSelectedTags }: {
    selectedTags: string[],
    setSelectedTags: (selectedTags: string[]) => void
}) {
    function tagButtonClickHandler(event: React.MouseEvent<HTMLButtonElement>, tag: string) {
        event?.preventDefault();

        if (selectedTags.includes(tag))
            setSelectedTags(selectedTags.filter((t: string) => t !== tag));
        else
            setSelectedTags([...selectedTags, tag]);
    }

    return (
        <div className={styles.tagsSectionContainer}>
            <h2 className={styles.formSectionTitle}>Tags</h2>
            <div className={styles.tagsContainer}>
                {possibleTags.map((tag: string, index: number) => (
                    <button key={index}
                            aria-selected={selectedTags.includes(tag)}
                            onClick={(e) => tagButtonClickHandler(e, tag)}
                            className={classNames(styles.roundButton, styles.tag)}>
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
});

const IsRecurrentSection = React.memo(function IsRecurrentSection(
    { isNewEventRecurrent, setIsNewEventRecurrent }: {
        isNewEventRecurrent: boolean,
        setIsNewEventRecurrent: (value: (((prevState: boolean) => boolean) | boolean)) => void
    }
) {
    return <div className={styles.recurrentEventSectionContainer}>
        <h2 className={styles.formSectionTitle}>Recurrence</h2>
        <TextField className={styles.recurrentEventSectionCheckboxField}>
            <Input className={styles.checkboxInput}
                   type="checkbox"
                   value={isNewEventRecurrent.toString()}
                   onChange={(e) => setIsNewEventRecurrent((Boolean)(e.target.value))} />
            <Label className={styles.formSectionTitle}>Every Week</Label>
        </TextField>
    </div>;
});

function CreateEventForm(
    {
        newEventTitle, setNewEventTitle, newEventStartDate, setNewEventStartDate, newEventEndDate,
        setNewEventEndDate, selectedTags, setSelectedTags, isNewEventRecurrent, setIsNewEventRecurrent
    }:
        {
            newEventTitle: string | undefined,
            setNewEventTitle: (title: string) => void,
            newEventStartDate: Date,
            setNewEventStartDate: (startDate: Date) => void,
            newEventEndDate: Date,
            setNewEventEndDate: (endDate: Date) => void,
            selectedTags: string[],
            setSelectedTags: (selectedTags: string[]) => void,
            isNewEventRecurrent: boolean,
            setIsNewEventRecurrent: (value: (((prevState: boolean) => boolean) | boolean)) => void
        }
) {
    return (
        <div className={styles.newEventForm}>
            <TitleSection title={newEventTitle} setTitle={setNewEventTitle} />
            <IsRecurrentSection isNewEventRecurrent={isNewEventRecurrent}
                                setIsNewEventRecurrent={setIsNewEventRecurrent} />
            <TagSection selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
        </div>
    );
}

export function CreateEventModal(
    {
        isModalOpen,
        setIsModalOpen,
        newEventTitle,
        setNewEventTitle,
        newEventStartDate,
        setNewEventStartDate,
        newEventEndDate,
        setNewEventEndDate,
        refreshUserEvents
    }: {
        isModalOpen: boolean,
        setIsModalOpen: (isOpen: boolean) => void,
        newEventTitle: string | undefined,
        setNewEventTitle: (title: string) => void,
        newEventStartDate: Date,
        setNewEventStartDate: (startDate: Date) => void,
        newEventEndDate: Date,
        setNewEventEndDate: (endDate: Date) => void,
        refreshUserEvents: () => void
    }
) {
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [isNewEventRecurrent, setIsNewEventRecurrent] = useState<boolean>(false);

    function clearFields() {
        setNewEventTitle("");
        setNewEventStartDate(new Date());
        setNewEventEndDate(new Date());
        setSelectedTags([]);
        setIsNewEventRecurrent(false);
    }

    const finishCreatingEventButtonDisabled = !newEventTitle;

    function createNewEventClickHandler() {
        if (finishCreatingEventButtonDisabled) {
            return;
        }
        service.createNewEvent({
            title: newEventTitle,
            startDate: newEventStartDate,
            endDate: newEventEndDate,
            tags: selectedTags,
            everyWeek: isNewEventRecurrent
        })
            .then(() => {
                clearFields();
                refreshUserEvents();
            })
        /*.catch((error) => setError(error))*/;
    }

    return (
        <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
            <Dialog aria-label={"New Event"}>
                {({ close }) => (
                    <div className={styles.newEventModalContainer}>
                        <Button className={classNames(styles.roundButton, styles.closeButton)} onPress={close}>
                            Close
                        </Button>
                        <h1 className={styles.newEventTitleText}>New Event</h1>
                        <div className={styles.newEventFormContainer}>
                            <CreateEventForm newEventTitle={newEventTitle}
                                             setNewEventTitle={setNewEventTitle}
                                             newEventStartDate={newEventStartDate}
                                             setNewEventStartDate={setNewEventStartDate}
                                             newEventEndDate={newEventEndDate}
                                             setNewEventEndDate={setNewEventEndDate}
                                             selectedTags={selectedTags}
                                             setSelectedTags={setSelectedTags}
                                             isNewEventRecurrent={isNewEventRecurrent}
                                             setIsNewEventRecurrent={setIsNewEventRecurrent}
                            />
                        </div>
                        <div className={styles.finishCreatingEventButtonContainer}>
                            <Button className={classNames(styles.finishCreatingEventButton)}
                                    isDisabled={finishCreatingEventButtonDisabled}
                                    onPress={() => {
                                        close();
                                        createNewEventClickHandler();
                                    }}>
                                Confirm!
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </Modal>
    );
}