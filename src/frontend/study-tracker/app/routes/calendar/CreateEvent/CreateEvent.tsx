import {
  Button,
  Dialog,
  Input,
  Label,
  Modal,
  TextField,
} from "react-aria-components";

import { useTranslation } from "react-i18next";

import classNames from "classnames";
import "./createEventReactAriaModal.css";
import styles from "./createEvent.module.css";
import React, { useEffect, useState } from "react";
import { service } from "~/service/service";

const possibleTags = ["study", "work", "personal", "fun"];

export const TitleSection = React.memo(function TitleSection({
  title,
  setTitle,
}: {
  title: string | undefined;
  setTitle: (title: string) => void;
}) {
  const { t } = useTranslation("calendar"); 

  return (
    <div className={styles.titleSectionContainer}>
      <TextField className={styles.formTextField} autoFocus>
        <Label className={styles.formSectionTitle}>{t("title_label")}</Label>
        <Input
          className={styles.formInput}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("title_label")}
        />
      </TextField>
    </div>
  );
});

export const DateSection = React.memo(function DeadlineSection({
  newEventStartDate,
  setNewEventStartDate,
  newEventEndDate,
  setNewEventEndDate,
}: {
  newEventStartDate: Date;
  setNewEventStartDate: (startDate: Date) => void;
  newEventEndDate: Date;
  setNewEventEndDate: (endDate: Date) => void;
}) {
  const { t } = useTranslation("calendar");  
  const [startDate, setStartDate] = useState(
    () => newEventStartDate.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    () => newEventEndDate.toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(() =>
    newEventStartDate.toTimeString().slice(0, 5)
  );
  const [endTime, setEndTime] = useState(() =>
    newEventEndDate.toTimeString().slice(0, 5)
  );

  // Sincronizar estados locais com props ao montar ou quando as props mudam
  useEffect(() => {
    setStartDate(newEventStartDate.toISOString().split("T")[0]);
    setStartTime(newEventStartDate.toTimeString().slice(0, 5));
  }, [newEventStartDate]);

  useEffect(() => {
    setEndDate(newEventEndDate.toISOString().split("T")[0]);
    setEndTime(newEventEndDate.toTimeString().slice(0, 5));
  }, [newEventEndDate]);

  useEffect(() => {
    const [startDateYear, startDateMonth, startDateDay] = startDate
      .split("-")
      .map(Number);
    const [endDateYear, endDateMonth, endDateDay] = endDate
      .split("-")
      .map(Number);

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const newStartDate = new Date(
      startDateYear,
      startDateMonth - 1, // Meses são baseados em 0
      startDateDay,
      startHours,
      startMinutes
    );

    const newEndDate = new Date(
      endDateYear,
      endDateMonth - 1, 
      endDateDay,
      endHours,
      endMinutes
    );

    setNewEventStartDate(newStartDate);
    setNewEventEndDate(newEndDate);
  }, [
    startDate,
    endDate,
    startTime,
    endTime,
    setNewEventStartDate,
    setNewEventEndDate,
  ]); 

  return (
    <div className={styles.dateSectionContainer}>
   
      <div
        aria-label={t("date_section_label")}
        className={styles.deadlineInputsContainer}
      >
        <TextField className={styles.formTextField}>
  
          <Label className={styles.formSectionTitle}>
            {t("start_date_label")}
          </Label>
          <Input
            type={"date"}
         
            aria-label={t("start_date_label")}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={classNames(styles.dateInput)}
          />
        </TextField>
        <TextField className={styles.formTextField}>
         
          <Label className={styles.formSectionTitle}>
            {t("start_time_label")}
          </Label>
          <Input
            type={"time"}
           
            aria-label={t("start_time_label")}
            value={startTime}
            onChange={(e) => {
              const timeValue =
                e.target.value.length !== 0 ? e.target.value : "12:00"; 
              setStartTime(timeValue);
            }}
            className={classNames(styles.timeInput)}
          />
        </TextField>
        <TextField className={styles.formTextField}>
   
          <Label className={styles.formSectionTitle}>
            {t("end_date_label")}
          </Label>
          <Input
            type={"date"}
           
            aria-label={t("end_date_label")}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={classNames(styles.dateInput)}
          />
        </TextField>
        <TextField className={styles.formTextField}>
         
          <Label className={styles.formSectionTitle}>
            {t("end_time_label")}
          </Label>
          <Input
            type={"time"}
           
            aria-label={t("end_time_label")}
            value={endTime}
            onChange={(e) => {
              const timeValue =
                e.target.value.length !== 0 ? e.target.value : "12:00"; 
              setEndTime(timeValue);
            }}
            className={classNames(styles.timeInput)}
          />
        </TextField>
      </div>
    </div>
  );
});

const IsRecurrentSection = React.memo(function IsRecurrentSection({
  isNewEventRecurrent,
  setIsNewEventRecurrent,
}: {
  isNewEventRecurrent: boolean;
  setIsNewEventRecurrent: (
    value: ((prevState: boolean) => boolean) | boolean
  ) => void;
}) {
  const { t } = useTranslation("calendar"); 
    <div className={styles.recurrentEventSectionContainer}>

      <h2 className={styles.formSectionTitle}>{t("recurrence_title")}</h2>
      <TextField className={styles.recurrentEventSectionCheckboxField}>
        <Input
          className={styles.checkboxInput}
          type="checkbox"
          checked={isNewEventRecurrent} 
          onChange={(e) => setIsNewEventRecurrent(e.target.checked)} 
        />

        <Label className={styles.formSectionTitle}>
          {t("every_week_label")}
        </Label>
      </TextField>
    </div>
  );
});

export const TagSection = React.memo(function TagSection({
  selectedTags,
  setSelectedTags,
}: {
  selectedTags: string[];
  setSelectedTags: (selectedTags: string[]) => void;
}) {
  const { t } = useTranslation("calendar"); 

  function tagButtonClickHandler(
    event: React.MouseEvent<HTMLButtonElement>,
    tag: string
  ) {
    event?.preventDefault(); 

    if (selectedTags.includes(tag))
      setSelectedTags(selectedTags.filter((t: string) => t !== tag));
    else setSelectedTags([...selectedTags, tag]);
  }

  return (
    <div className={styles.tagsSectionContainer}>
      
      <h2 className={styles.formSectionTitle}>{t("tags_title")}</h2>
      <div className={styles.tagsContainer}>
        {possibleTags.map((tag: string, index: number) => (
          <Button 
            key={index}
            aria-selected={selectedTags.includes(tag)}
            onPress={(e) => tagButtonClickHandler(e as any, tag)} 
            className={classNames(styles.roundButton, styles.tag)}
          >
            
            {t(tag)}
          </Button>
        ))}
      </div>
    </div>
  );
});


function CreateEventForm({
  newEventTitle,
  setNewEventTitle,
  newEventStartDate,
  setNewEventStartDate,
  newEventEndDate,
  setNewEventEndDate,
  selectedTags,
  setSelectedTags,
  isNewEventRecurrent,
  setIsNewEventRecurrent,
}: {
  newEventTitle: string | undefined;
  setNewEventTitle: (title: string) => void;
  newEventStartDate: Date;
  setNewEventStartDate: (startDate: Date) => void;
  newEventEndDate: Date;
  setNewEventEndDate: (endDate: Date) => void;
  selectedTags: string[];
  setSelectedTags: (selectedTags: string[]) => void;
  isNewEventRecurrent: boolean;
  setIsNewEventRecurrent: (
    value: ((prevState: boolean) => boolean) | boolean
  ) => void;
}) {
  return (
    <div className={styles.newEventForm}>
      <TitleSection title={newEventTitle} setTitle={setNewEventTitle} />
      <DateSection
        newEventStartDate={newEventStartDate}
        setNewEventStartDate={setNewEventStartDate}
        newEventEndDate={newEventEndDate}
        setNewEventEndDate={setNewEventEndDate}
      />
      <IsRecurrentSection
        isNewEventRecurrent={isNewEventRecurrent}
        setIsNewEventRecurrent={setIsNewEventRecurrent}
      />
      <TagSection
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
    </div>
  );
}

export function CreateEventModal({
  isModalOpen,
  setIsModalOpen,
  newEventTitle,
  setNewEventTitle,
  newEventStartDate,
  setNewEventStartDate,
  newEventEndDate,
  setNewEventEndDate,
  refreshUserEvents,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  newEventTitle: string | undefined;
  setNewEventTitle: (title: string) => void;
  newEventStartDate: Date;
  setNewEventStartDate: (startDate: Date) => void;
  newEventEndDate: Date;
  setNewEventEndDate: (endDate: Date) => void;
  refreshUserEvents: () => void;
}) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isNewEventRecurrent, setIsNewEventRecurrent] =
    useState<boolean>(false);
  const { t } = useTranslation("calendar");

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
    service
      .createNewEvent({
        title: newEventTitle,
        startDate: newEventStartDate,
        endDate: newEventEndDate,
        tags: selectedTags,
        everyWeek: isNewEventRecurrent,
      })
      .then(() => {
        clearFields();
        refreshUserEvents();
      });
    
  }

  return (
    <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>

      <Dialog aria-label={t("new_event_modal_title")}>
        {({ close }) => (
          <div className={styles.newEventModalContainer}>
            <Button
              className={classNames(styles.roundButton, styles.closeButton)}
              onPress={close}
            >
             
              {t("close_button")}
            </Button>
           
            <h1 className={styles.newEventTitleText}>
              {t("new_event_modal_title")}
            </h1>
            <div className={styles.newEventFormContainer}>
              <CreateEventForm
                newEventTitle={newEventTitle}
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
              <Button
                className={classNames(styles.finishCreatingEventButton)}
                isDisabled={finishCreatingEventButtonDisabled}
                onPress={() => {
                  close();
                  createNewEventClickHandler();
                }}
              >
                {t("confirm_button")}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </Modal>
  );
}
