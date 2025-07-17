import {
  Button,
  Dialog,
  Input,
  Label,
  Modal,
  TextField,
  Select,
  SelectValue,
  Popover,
  ListBox,
} from "react-aria-components";

import { useTranslation } from "react-i18next";

import classNames from "classnames";
import "./createEventReactAriaModal.css";
import styles from "./createEvent.module.css";
import React, { useEffect, useState } from "react";
import { service } from "../../../service/service"; // Certifique-se que o caminho está correto

const possibleTags = ["study", "work", "personal", "fun"];
export type RecurrenceType = "none" | "daily" | "weekly"; // Adicione aqui mais tipos se necessário

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
      startDateMonth - 1,
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

export const IsRecurrentSection = React.memo(function IsRecurrentSection({
  recurrenceType,
  setRecurrenceType,
}: {
  recurrenceType: RecurrenceType;
  setRecurrenceType: (value: RecurrenceType) => void;
}) {
  const { t } = useTranslation("calendar");

  const recurrenceOptions = [
    { id: "none", labelKey: "recurrence_none_label" },
    { id: "daily", labelKey: "recurrence_daily_label" },
    { id: "weekly", labelKey: "recurrence_weekly_label" },
    // Adicione outras opções aqui se precisar no futuro
  ];

  return (
    <div className={styles.recurrentEventSectionContainer}>
      <h2 className={styles.formSectionTitle}>{t("recurrence_title")}</h2>
      <select
        id="recurrence-select"
        aria-label={t("recurrence_label")}
        value={recurrenceType}
        onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
        className={styles.nativeSelect}
      >
        {recurrenceOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
});

export const TagSection = function TagSection({
  // Mantido sem React.memo para teste
  selectedTags,
  setSelectedTags,
}: {
  selectedTags: string[];
  setSelectedTags: (selectedTags: string[]) => void;
}) {
  const { t } = useTranslation("calendar");

  function tagButtonClickHandler(tag: string) {
    // console.log("Tag clicada:", tag);
    // console.log("selectedTags ANTES da atualização:", selectedTags);

    setSelectedTags((prevSelectedTags) => {
      const isSelected = prevSelectedTags.includes(tag);
      let newTags;
      if (isSelected) {
        newTags = prevSelectedTags.filter((t: string) => t !== tag);
      } else {
        newTags = [...prevSelectedTags, tag];
      }
      // console.log("Tags DEPOIS (adicionar/remover):", newTags);
      return newTags;
    });
  }

  return (
    <div className={styles.tagsSectionContainer}>
      <h2 className={styles.formSectionTitle}>{t("tags_title")}</h2>
      <div className={styles.tagsContainer}>
        {possibleTags.map((tag: string, index: number) => (
          <Button
            key={index}
            onPress={() => tagButtonClickHandler(tag)}
            className={classNames(
              styles.roundButton,
              styles.tag,
              { [styles.selectedTag]: selectedTags.includes(tag) } // Classe condicional para estilo
            )}
          >
            {t(tag)}
          </Button>
        ))}
      </div>
    </div>
  );
};

function CreateEventForm({
  newEventTitle,
  setNewEventTitle,
  newEventStartDate,
  setNewEventStartDate,
  newEventEndDate,
  setNewEventEndDate,
  selectedTags,
  setSelectedTags,
  recurrenceType,
  setRecurrenceType,
}: {
  newEventTitle: string | undefined;
  setNewEventTitle: (title: string) => void;
  newEventStartDate: Date;
  setNewEventStartDate: (startDate: Date) => void;
  newEventEndDate: Date;
  setNewEventEndDate: (endDate: Date) => void;
  selectedTags: string[];
  setSelectedTags: (selectedTags: string[]) => void;
  recurrenceType: RecurrenceType;
  setRecurrenceType: (value: RecurrenceType) => void;
}) {
  // As props isNewEventRecurrent e isNewEventEveryDay e seus setters foram removidos daqui
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
        recurrenceType={recurrenceType}
        setRecurrenceType={setRecurrenceType}
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
  // Estados antigos removidos:
  // const [isNewEventRecurrent, setIsNewEventRecurrent] = useState<boolean>(false);
  // const [isNewEventEveryDay, setIsNewEventEveryDay] = useState<boolean>(false);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("none"); // Novo estado de recorrência
  const { t } = useTranslation("calendar");

  function clearFields() {
    setNewEventTitle("");
    setNewEventStartDate(new Date());
    setNewEventEndDate(new Date());
    setSelectedTags([]);
    setRecurrenceType("none"); // Limpa para o valor padrão
  }

  const finishCreatingEventButtonDisabled = !newEventTitle;

  function createNewEventClickHandler() {
    if (finishCreatingEventButtonDisabled) {
      return;
    }

    // Mapear recurrenceType para os campos booleanos esperados pelo backend
    const everyWeek = recurrenceType === "weekly";
    const everyDay = recurrenceType === "daily";

    service
      .createNewEvent({
        title: newEventTitle,
        startDate: newEventStartDate,
        endDate: newEventEndDate,
        tags: selectedTags,
        everyWeek: everyWeek,
        everyDay: everyDay,
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
                recurrenceType={recurrenceType}
                setRecurrenceType={setRecurrenceType}
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
