import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Dialog, Input, Label, TextField } from "react-aria-components";
import styles from "./slotToWork.module.css";
import classNames from "classnames";
import { SecondModalContext } from "~/routes/tasks/CreateTask/SecondModalContext";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { SlotToWorkDto } from "~/service/output_dtos";

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return t("task:unset_date");
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const formatTime = (timeString: string | undefined) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
};

const formatTimes = (startTimeString: string | undefined, endTimeString: string | undefined) => {
    if (!startTimeString || !endTimeString) return t("task:unset_time_range");
    return `${formatTime(startTimeString)} to ${formatTime(endTimeString)}`;
};

export function SlotToWork({ index, newlyAdded, onClosePressed }: { index: number, newlyAdded: boolean, onClosePressed: (slot: SlotToWorkDto | undefined) => void }) {
    const { t } = useTranslation(["task"]);
    
    const {
        setIsSecondModalOpen,
        isSecondModalOpen,
        setSecondModalContent,
        setSecondModalClass
    } = useContext(SecondModalContext);
    
    const [date, setDate] = useState<string | undefined>(undefined);
    const [startTime, setStartTime] = useState<string | undefined>(undefined);
    const [endTime, setEndTime] = useState<string | undefined>(undefined);
    
    const dateRef = useRef<string | undefined>(undefined)
    const startTimeRef = useRef<string | undefined>(undefined)
    const endTimeRef = useRef<string | undefined>(undefined)

    useEffect(() => {
        dateRef.current = date;
    }, [date]);

    useEffect(() => {
        startTimeRef.current = startTime;
    }, [startTime]);

    useEffect(() => {
        endTimeRef.current = endTime;
    }, [endTime]);
    
    const [isThisSlotToWorkModalOpen, setIsThisSlotToWorkModalOpen] = useState<boolean>(false);

    const ModalContent = (
        <Dialog id={`secondModal-slotWork-${index}`} aria-labelledby={`slotToWork-button-${index}`}>
            {({ close }) => (
                <div className={styles.modalContainer}>
                    <Button
                        className={classNames(styles.closeButton)}
                        onPress={() => {
                            const createValidDate = (date: string | undefined, time: string | undefined) => {
                                if (!date || !time) return undefined;
    
                                const [year, month, day] = date.split("-").map(Number);
                                const [hours, minutes] = time.split(":").map(Number);
                                const newDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
                                return isNaN(newDate.getTime()) ? undefined : newDate;
                            };

                            //console.log(dateRef.current, startTimeRef.current, endTimeRef.current)
    
                            const start = createValidDate(dateRef.current, startTimeRef.current);
                            const end = createValidDate(dateRef.current, endTimeRef.current);
    
                            if (start && end) {
                                onClosePressed({ start, end });
                            } else {
                                //console.log("Noooooo")
                                onClosePressed(undefined);
                            }
    
                            setIsThisSlotToWorkModalOpen(false);
                            close();
                        }}
                    >
                        {t("task:close")}
                    </Button>
                    <h1 className={styles.mainFormModalTitleText}>Slot to Work</h1>
                    <div className={styles.slotFormContainer}>
                        <TextField autoFocus>
                            <Label className={styles.formSectionTitle}>{t("task:slot_date_to_work")}</Label>
                            <Input
                                type="date"
                                value={dateRef.current}
                                onChange={(e) => setDate(e.target.value)}
                                className={classNames(styles.dateInput)}
                            />
                        </TextField>
                        <TextField>
                            <Label className={styles.formSectionTitle}>{t("task:slot_starting_time")}</Label>
                            <Input
                                type="time"
                                value={startTimeRef.current}
                                onChange={(e) => setStartTime(e.target.value)}
                                className={classNames(styles.timeInput)}
                            />
                        </TextField>
                        <TextField>
                            <Label className={styles.formSectionTitle}>{t("task:slot_ending_time")}</Label>
                            <Input
                                type="time"
                                value={endTimeRef.current}
                                onChange={(e) => setEndTime(e.target.value)}
                                className={classNames(styles.timeInput)}
                            />
                        </TextField>
                    </div>
                </div>
            )}
        </Dialog>
    );
    

    const formattedDate = formatDate(date);
    const formattedTimes = formatTimes(startTime, endTime);

    console.log(date, startTime, endTime)

    return (
        <Button className={styles.slotToWorkButton}
                id={`slotToWork-button-${index}`}
                aria-label={
                    `Slot to work ${index + 1} - ${formattedDate}, ${formattedTimes}`}
                aria-expanded={isSecondModalOpen && isThisSlotToWorkModalOpen}
                data-newly-added={newlyAdded}
                onPress={() => {
                    setIsThisSlotToWorkModalOpen(true);
                    setIsSecondModalOpen(true);
                    setSecondModalContent(ModalContent);
                    setSecondModalClass(styles.slotToWorkModal);
                }}>
            <div className={styles.slotToWorkText}>
                <span style={{ textWrap: "nowrap" }}>
                {
                    date
                        ? <span>{formattedDate}</span>
                        : <span style={{ opacity: "0.7" }}>{t("task:unset_date")}</span>
                }
                    {
                        ", "
                    }
                </span>
                <span style={{ textWrap: "nowrap" }}>
                    {
                        startTime && endTime
                            ? <span>{formattedTimes}</span>
                            : <span style={{ opacity: "0.7" }}>{t("task:unset_time_range")}</span>
                    }
                </span>
            </div>
        </Button>
    );
}