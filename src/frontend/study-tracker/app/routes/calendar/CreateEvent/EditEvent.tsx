import React, { useEffect, useState } from "react";
import { Button, Dialog, Input, Label, Modal, TextField } from "react-aria-components";
import styles from "~/routes/calendar/CreateEvent/createEvent.module.css";
import classNames from "classnames";
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

const DateSection = React.memo(function DeadlineSection(
    { newEventStartDate, setNewEventStartDate, newEventEndDate, setNewEventEndDate }:
        {
            newEventStartDate: Date,
            setNewEventStartDate: (startDate: Date) => void,
            newEventEndDate: Date,
            setNewEventEndDate: (endDate: Date) => void
        }
) {
    const [startDate, setStartDate] = useState(newEventStartDate.toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(newEventEndDate.toISOString().split("T")[0]);
    const [startTime, setStartTime] = useState(newEventStartDate.toTimeString().slice(0, 5));
    const [endTime, setEndTime] = useState(newEventEndDate.toTimeString().slice(0, 5));

    useEffect(() => {
        const [startDateYear, startDateMonth, startDateDay] = startDate.split("-");
        const [endDateYear, endDateMonth, endDateDay] = endDate.split("-");

        const [startHours, startMinutes] = startTime.split(":");
        const [endHours, endMinutes] = endTime.split(":");

        const newStartDate = new Date(
            parseInt(startDateYear),
            parseInt(startDateMonth) - 1,
            parseInt(startDateDay),
            parseInt(startHours),
            parseInt(startMinutes)
        );

        const newEndDate = new Date(
            parseInt(endDateYear),
            parseInt(endDateMonth) - 1,
            parseInt(endDateDay),
            parseInt(endHours),
            parseInt(endMinutes)
        );

        setNewEventStartDate(newStartDate);
        setNewEventEndDate(newEndDate);
    }, [startDate, endDate, startTime, endTime]);

    return (
        <div className={styles.dateSectionContainer}>
            <div aria-label={`Date`} className={styles.deadlineInputsContainer}>
                <TextField>
                    <Label className={styles.formSectionTitle}>Start Date</Label>
                    <Input type={"date"}
                           aria-label={"Start date"}
                           value={startDate}
                           onChange={(e) => setStartDate(e.target.value)}
                           className={classNames(styles.dateInput)} />
                </TextField>
                <TextField>
                    <Label className={styles.formSectionTitle}>Start Time</Label>
                    <Input type={"time"}
                           aria-label={"Start time"}
                           value={startTime}
                           onChange={(e) => {
                               const timeValue = e.target.value.length !== 0 ? e.target.value : "12:00";
                               setStartTime(timeValue);
                           }}
                           className={classNames(styles.timeInput)} />
                </TextField>
                <TextField>
                    <Label className={styles.formSectionTitle}>End Date</Label>
                    <Input type={"date"}
                           aria-label={"End date"}
                           value={endDate}
                           onChange={(e) => setEndDate(e.target.value)}
                           className={classNames(styles.dateInput)} />
                </TextField>
                <TextField>
                    <Label className={styles.formSectionTitle}>End Time</Label>
                    <Input type={"time"}
                           aria-label={"End time"}
                           value={endTime}
                           onChange={(e) => {
                               const timeValue = e.target.value.length !== 0 ? e.target.value : "12:00";
                               setEndTime(timeValue);
                           }}
                           className={classNames(styles.timeInput)} />
                </TextField>
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
                   checked={isNewEventRecurrent}
                   onChange={(e) => setIsNewEventRecurrent(e.target.checked)}
            />
            <Label className={styles.formSectionTitle}>Every Week</Label>
        </TextField>
    </div>;
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

function EditEventForm(
    {
        eventTitle,
        setEventTitle,
        eventStartDate,
        setEventStartDate,
        eventEndDate,
        setEventEndDate,
        selectedTags, setSelectedTags, eventRecurrent, setEventRecurrent
    }:
        {
            eventTitle: string | undefined,
            setEventTitle: (title: string) => void,
            eventStartDate: Date,
            setEventStartDate: (startDate: Date) => void,
            eventEndDate: Date,
            setEventEndDate: (endDate: Date) => void,
            selectedTags: string[],
            setSelectedTags: (selectedTags: string[]) => void,
            eventRecurrent: boolean,
            setEventRecurrent: (value: (((prevState: boolean) => boolean) | boolean)) => void
        }
) {
    return (
        <div className={styles.newEventForm}>
            <TitleSection title={eventTitle} setTitle={setEventTitle} />
            <DateSection newEventStartDate={eventStartDate}
                         setNewEventStartDate={setEventStartDate}
                         newEventEndDate={eventEndDate}
                         setNewEventEndDate={setEventEndDate}
            />
            <IsRecurrentSection isNewEventRecurrent={eventRecurrent}
                                setIsNewEventRecurrent={setEventRecurrent} />
            <TagSection selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
        </div>
    );
}

export function EditEventModal(
    {
        isModalOpen,
        setIsModalOpen,
        eventId,
        eventTitle,
        setEventTitle,
        eventStartDate,
        setEventStartDate,
        eventEndDate,
        setEventEndDate,
        eventTags,
        setEventTags,
        eventRecurrent,
        setEventRecurrent,
        refreshUserEvents
    }: {
        isModalOpen: boolean,
        setIsModalOpen: (isOpen: boolean) => void,
        eventId: number,
        eventTitle: string | undefined,
        setEventTitle: (title: string) => void,
        eventStartDate: Date,
        setEventStartDate: (startDate: Date) => void,
        eventEndDate: Date,
        setEventEndDate: (endDate: Date) => void,
        eventTags: string[],
        setEventTags: (tags: string[] | ((prevTags: string[]) => string[])) => void,
        eventRecurrent: boolean,
        setEventRecurrent: (value: (((prevState: boolean) => boolean) | boolean)) => void,
        refreshUserEvents: () => void
    }
) {
    function clearFields() {
        setEventTitle("");
        setEventStartDate(new Date());
        setEventEndDate(new Date());
        setEventTags([]);
        setEventRecurrent(false);
    }

    const finishEditingEventButtonDisabled = !eventTitle;

    function editEventClickHandler() {
        if (finishEditingEventButtonDisabled) {
            return;
        }
        service.updateEvent(eventId,
            {
                title: eventTitle,
                startDate: eventStartDate,
                endDate: eventEndDate,
                tags: eventTags,
                everyWeek: eventRecurrent
            })
            .then(() => {
                clearFields();
                refreshUserEvents();
            })
        /*.catch((error) => setGlobalError(error))*/;
    }

    return (
        <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
            <Dialog aria-label={"Edit Event"}>
                {({ close }) => (
                    <div className={styles.newEventModalContainer}>
                        <Button className={classNames(styles.roundButton, styles.closeButton)} onPress={close}>
                            Close
                        </Button>
                        <h1 className={styles.newEventTitleText}>Edit Event</h1>
                        <div className={styles.newEventFormContainer}>
                            <EditEventForm eventTitle={eventTitle}
                                           setEventTitle={setEventTitle}
                                           eventStartDate={eventStartDate}
                                           setEventStartDate={setEventStartDate}
                                           eventEndDate={eventEndDate}
                                           setEventEndDate={setEventEndDate}
                                           selectedTags={eventTags}
                                           setSelectedTags={setEventTags}
                                           eventRecurrent={eventRecurrent}
                                           setEventRecurrent={setEventRecurrent}
                            />
                        </div>
                        <div className={styles.finishCreatingEventButtonContainer}>
                            <Button className={classNames(styles.finishCreatingEventButton)}
                                    isDisabled={finishEditingEventButtonDisabled}
                                    onPress={() => {
                                        close();
                                        editEventClickHandler();
                                    }}>
                                Save
                            </Button>
                        </div>
                    </div>
                )}
            </Dialog>
        </Modal>
    );
}