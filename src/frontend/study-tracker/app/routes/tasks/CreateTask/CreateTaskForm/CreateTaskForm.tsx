import React, { useEffect, useState } from "react";
import styles from "../createTask.module.css";
import { Button, Input, Label, TextField } from "react-aria-components";
import { SlotToWork } from "~/routes/tasks/CreateTask/SlotToWork/SlotToWork";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { SlotToWorkDto } from "~/service/output_dtos";

const possibleTags = [
    "study",
    "work",
    "personal",
    "fun"
];

const priorityValues = [
    "low",
    "medium",
    "high"
];

const TitleSection = React.memo(function TitleSection({ title, setTitle }: {
    title: string | undefined,
    setTitle: (title: string) => void
}) {
    const { t } = useTranslation(["task"]);
    return (
        <div className={styles.titleSectionContainer}>
            <TextField className={styles.formTextField}
                       autoFocus>
                <Label className={styles.formSectionTitle}>
                    {t("task:title_label")}
                </Label>
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

const DescriptionSection = React.memo(function DescriptionSection({ description, setDescription }: {
    description: string | undefined,
    setDescription: (description: string) => void
}) {
    const { t } = useTranslation(["task"]);
    return (
        <div className={styles.titleSectionContainer}>
            <TextField className={styles.formTextField}>
                <Label className={styles.formSectionTitle}>
                    {t("task:description_label")}
                </Label>
                <Input className={styles.formInput}
                       required
                       value={description}
                       onChange={
                           (e) => setDescription(e.target.value)
                       } />
            </TextField>
        </div>
    );
});

const SlotsToWorkSection = React.memo(function SlotsToWorkSection({ slotsToWork, setSlotsToWork }: {
    slotsToWork: SlotToWorkDto[],
    setSlotsToWork: (slotsToWork: SlotToWorkDto[]) => void
}) {
    const { t } = useTranslation(["task"]);
    const [slotAddingQueue, setSlotAddingQueue] = useState<number[]>([]);

    const [slotsToWorkNumber, setSlotsToWorkNumber] = useState(slotsToWork.length);

    function addToSlotAddingQueue(index: number) {
        setSlotAddingQueue((slotAddingQueue) => [...slotAddingQueue, index]);
        setTimeout(() => {
            setSlotAddingQueue((slotAddingQueue) => slotAddingQueue.filter((i) => i !== index));
        }, 1000);
    }

    return (
        <div className={styles.slotsToWorkSectionContainer}>
            <h2 className={styles.formSectionTitle}>
                {t("task:slots_to_work_label")}
            </h2>
            <div className={styles.slotsToWorkContainer}>
                {Array.from({ length: slotsToWorkNumber }).map((_, index) => (
                    <SlotToWork
                        key={index}
                        index={index}
                        newlyAdded={slotAddingQueue.includes(index)}
                        onClosePressed={(slot: SlotToWorkDto | undefined) => {
                            if (slot) {
                                console.log(slot);
                                const newSlotsToWork = [...slotsToWork];
                                newSlotsToWork.push(slot);
                                setSlotsToWork(newSlotsToWork);
                            } else
                                console.log("Invalid date");
                        }}
                    />
                ))}
            </div>
            <Button
                onPress={() => {
                    setSlotsToWorkNumber(slotsToWorkNumber + 1);
                    addToSlotAddingQueue(slotsToWorkNumber);
                }}
                className={classNames(styles.addSlotToWorkButton)}>
                {t("task:add_slot_to_work")}
            </Button>
        </div>
    );
});

const DeadlineSection = React.memo(function DeadlineSection({ deadline, setDeadline }: {
    deadline: Date | undefined,
    setDeadline: (deadline: Date | undefined) => void
}) {
    const { t } = useTranslation(["task"]);

    const [date, setDate] = useState<string>(deadline?.toISOString().split("T")[0] ?? "");
    const [time, setTime] = useState<string>(deadline?.toISOString().split("T")[1].split(".")[0] ?? "");

    useEffect(() => {
        if (date) {
            const combinedDateTime = new Date(date);
            if (time) {
                const [hours, minutes] = time.split(":").map(Number);
                combinedDateTime.setHours(hours, minutes);
            }
            setDeadline(combinedDateTime);
        } else {
            setDeadline(undefined);
        }
    }, [date, time, setDeadline]);

    return (
        <div className={styles.deadlineSectionContainer}>
            <h2 className={styles.formSectionTitle}>
                {t("task:deadline_label")}
            </h2>
            <div aria-label="Deadline" className={styles.deadlineInputsContainer}>
                <Input
                    type="date"
                    aria-label="Date for deadline"
                    className={classNames(styles.dateInput)}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
                <Input
                    type="time"
                    aria-label="Time for deadline"
                    className={classNames(styles.timeInput)}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />
            </div>
        </div>
    );
});


const PrioritySection = React.memo(function PrioritySection({ priority, setPriority }: {
    priority: string | undefined,
    setPriority: (priority: string) => void
}) {
    const { t } = useTranslation(["task"]);

    function priorityButtonClickHandler(event: React.MouseEvent<HTMLButtonElement>, priority: string) {
        event?.preventDefault();

        setPriority(priority);
    }

    return (
        <div className={styles.prioritySectionContainer}>
            <h1 className={styles.formSectionTitle}>
                {t("task:priority_label")}
            </h1>
            <div className={styles.priorityValuesContainer}>
                {
                    priorityValues.map((priorityValue, index) => (
                        <button key={index}
                                aria-selected={priority === priorityValue}
                                onClick={(e) => priorityButtonClickHandler(e, priorityValue)}
                                className={classNames(
                                    styles.priorityButton,
                                    styles[`${priorityValue}Priority`]
                                )}>
                            {t(`task:priority_option_${priorityValue}`)}
                        </button>
                    ))
                }
            </div>
        </div>
    );
});

const TagSection = React.memo(function TagSection({ selectedTags, setSelectedTags }: {
    selectedTags: string[],
    setSelectedTags: (selectedTags: string[]) => void
}) {
    const { t } = useTranslation(["task"]);

    function tagButtonClickHandler(event: React.MouseEvent<HTMLButtonElement>, tag: string) {
        event?.preventDefault();

        if (selectedTags.includes(tag))
            setSelectedTags(selectedTags.filter((t: string) => t !== tag));
        else
            setSelectedTags([...selectedTags, tag]);
    }

    return (
        <div className={styles.tagsSectionContainer}>
            <h1 className={styles.formSectionTitle}>
                {t("task:tags_label")}
            </h1>
            <div className={styles.tagsContainer}>
                {possibleTags.map((tag: string, index: number) => (
                    <button key={index}
                            aria-selected={selectedTags.includes(tag)}
                            onClick={(e) => tagButtonClickHandler(e, tag)}
                            className={classNames(styles.tag)}>
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
});

export function CreateTaskForm(
    {
        description,
        setDescription,
        slotsToWork,
        setSlotsToWork,
        deadline,
        setDeadline,
        selectedTags,
        setSelectedTags,
        title,
        setTitle,
        priority,
        setPriority
    }: {
        description: string | undefined,
        setDescription: (description: string) => void,
        slotsToWork: SlotToWorkDto[],
        setSlotsToWork: (slotsToWork: SlotToWorkDto[]) => void,
        deadline: Date | undefined,
        setDeadline: (deadline: Date | undefined) => void,
        selectedTags: string[],
        setSelectedTags: (selectedTags: string[]) => void,
        title: string | undefined,
        setTitle: (title: string) => void,
        priority: string | undefined,
        setPriority: (priority: string) => void,
    }) {
    return (<form className={styles.newTaskForm}>
        <TitleSection title={title} setTitle={setTitle} />
        <DescriptionSection description={description} setDescription={setDescription} />
        <SlotsToWorkSection slotsToWork={slotsToWork} setSlotsToWork={setSlotsToWork} />
        <DeadlineSection deadline={deadline} setDeadline={setDeadline} />
        <PrioritySection priority={priority} setPriority={setPriority} />
        <TagSection selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
    </form>);
}