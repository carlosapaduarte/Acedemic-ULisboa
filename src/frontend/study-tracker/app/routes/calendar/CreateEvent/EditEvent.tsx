import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  Input,
  Label,
  Modal,
  TextField,
} from "react-aria-components";
import { useTranslation } from "react-i18next";
import styles from "~/routes/calendar/CreateEvent/createEvent.module.css";
import classNames from "classnames";
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
      endDateMonth - 1, // Meses são baseados em 0
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
                e.target.value.length !== 0 ? e.target.value : "00:00"; // Usar "00:00" para 24h
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
                e.target.value.length !== 0 ? e.target.value : "00:00";
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
  isNewEventRecurrent,
  setIsNewEventRecurrent,
}: {
  isNewEventRecurrent: boolean;
  setIsNewEventRecurrent: (
    value: ((prevState: boolean) => boolean) | boolean
  ) => void;
}) {
  const { t } = useTranslation("calendar");
  return (
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

function EditEventForm({
  eventTitle,
  setEventTitle,
  eventStartDate,
  setEventStartDate,
  eventEndDate,
  setEventEndDate,
  selectedTags,
  setSelectedTags,
  eventRecurrent,
  setEventRecurrent,
}: {
  eventTitle: string | undefined;
  setEventTitle: (title: string) => void;
  eventStartDate: Date;
  setEventStartDate: (startDate: Date) => void;
  eventEndDate: Date;
  setEventEndDate: (endDate: Date) => void;
  selectedTags: string[];
  setSelectedTags: (selectedTags: string[]) => void;
  eventRecurrent: boolean;
  setEventRecurrent: (
    value: ((prevState: boolean) => boolean) | boolean
  ) => void;
}) {
  return (
    <div className={styles.newEventForm}>
      <TitleSection title={eventTitle} setTitle={setEventTitle} />
      <DateSection
        newEventStartDate={eventStartDate}
        setNewEventStartDate={setEventStartDate}
        newEventEndDate={eventEndDate}
        setNewEventEndDate={setEventEndDate}
      />
      <IsRecurrentSection
        isNewEventRecurrent={eventRecurrent}
        setIsNewEventRecurrent={setEventRecurrent}
      />
      <TagSection
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
    </div>
  );
}

export function EditEventModal({
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
  refreshUserEvents,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  eventId: number;
  eventTitle: string | undefined;
  setEventTitle: (title: string) => void;
  eventStartDate: Date;
  setEventStartDate: (startDate: Date) => void;
  eventEndDate: Date;
  setEventEndDate: (endDate: Date) => void;
  eventTags: string[];
  setEventTags: (tags: string[] | ((prevTags: string[]) => string[])) => void;
  eventRecurrent: boolean;
  setEventRecurrent: (
    value: ((prevState: boolean) => boolean) | boolean
  ) => void;
  refreshUserEvents: () => void;
}) {
  const { t } = useTranslation("calendar");

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
    service
      .updateEvent(eventId, {
        title: eventTitle,
        startDate: eventStartDate,
        endDate: eventEndDate,
        tags: eventTags,
        everyWeek: eventRecurrent,
      })
      .then(() => {
        close(); // Fechar o modal após sucesso
        clearFields();
        refreshUserEvents();
      });
    /*.catch((error) => setGlobalError(error))*/
  }

  function deleteEventClickHandler() {
    // Adicionar confirmação ao usuário, talvez um modal de confirmação
    // NÃO USAR window.confirm() em ambiente de iframe. Usar um modal personalizado.
    // Por enquanto, vou manter a lógica, mas idealmente seria um modal de UI.
    if (!window.confirm(t("confirm_delete_event"))) {
      // <-- CHAVE A ADICIONAR NO JSON
      return;
    }

    service.deleteEvent(eventId).then(() => {
      close(); // Fechar o modal após sucesso
      clearFields();
      refreshUserEvents();
    });
    /*.catch((error) => setGlobalError(error))*/
  }

  return (
    <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog aria-label={t("edit_event_modal_title")}>
        {({ close }) => (
          <div className={styles.newEventModalContainer}>
            <Button
              className={classNames(styles.roundButton, styles.closeButton)}
              onPress={close}
            >
              {t("close_button")}
            </Button>
            <h1 className={styles.newEventTitleText}>
              {t("edit_event_modal_title")}
            </h1>
            <div className={styles.newEventFormContainer}>
              <EditEventForm
                eventTitle={eventTitle}
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
              <Button
                className={classNames(styles.deleteEventButton)}
                onPress={() => {
                  deleteEventClickHandler();
                }}
              >
                {t("delete_button")}
              </Button>
              <Button
                className={classNames(styles.finishCreatingEventButton)}
                isDisabled={finishEditingEventButtonDisabled}
                onPress={() => {
                  editEventClickHandler();
                }}
              >
                {t("save_button")}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </Modal>
  );
}
