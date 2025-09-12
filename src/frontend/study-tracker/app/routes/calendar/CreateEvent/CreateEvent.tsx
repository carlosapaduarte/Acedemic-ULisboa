import {
  Button,
  Dialog,
  Input,
  Label,
  Modal,
  TextField,
} from "react-aria-components";

import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import classNames from "classnames";
import "./createEventReactAriaModal.css";
import styles from "./createEvent.module.css";
import { service } from "../../../service/service";
import { ColorPickerInput } from "~/components/ColorPickerInput/ColorPickerInput";

interface Tag {
  id: string;
  name: string;
  user_id: number;
}

export type RecurrenceType = "none" | "daily" | "weekly";

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

export const NotesSection = React.memo(function NotesSection({
  notes,
  setNotes,
}: {
  notes: string;
  setNotes: (notes: string) => void;
}) {
  const { t } = useTranslation("calendar");

  return (
    <div className={styles.notesSectionContainer}>
      <TextField className={styles.formTextField}>
        <Label className={styles.formSectionTitle}>{t("notes_label")}</Label>
        <textarea
          id="notes"
          className={styles.formInput}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("notes_placeholder")}
          rows={3}
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
  selectedTags,
  setSelectedTags,
}: {
  selectedTags: string[];
  setSelectedTags: (selectedTags: string[]) => void;
}) {
  const { t } = useTranslation("calendar");
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTagNameInput, setNewTagNameInput] = useState<string>("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagErrorMessage, setTagErrorMessage] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setTagErrorMessage(null);
      const fetchedTags = await service.fetchUserTags();
      console.log("Fetched tags:", fetchedTags);
      setAvailableTags(fetchedTags);
    } catch (error) {
      console.error("Erro ao buscar tags:", error);
      setTagErrorMessage(t("error_fetching_tags"));
    }
  }, [t]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreateTag = async () => {
    if (!newTagNameInput.trim()) {
      setTagErrorMessage(t("tag_name_cannot_be_empty"));
      return;
    }

    const existingTagByName = availableTags.find(
      (tag) => tag.name.toLowerCase() === newTagNameInput.toLowerCase()
    );
    if (existingTagByName) {
      setTagErrorMessage(t("tag_already_exists_for_user"));
      return;
    }

    setIsCreatingTag(true);
    setTagErrorMessage(null);

    try {
      const newTag = await service.createTag(newTagNameInput);
      setAvailableTags((prevTags) => [...prevTags, newTag]);
      setSelectedTags((prevSelected) => [...prevSelected, newTag.id]);
      setNewTagNameInput("");
    } catch (error: any) {
      console.error("Erro ao criar tag:", error);
      if (error && error.type === "TAG_ALREADY_EXISTS_FOR_USER") {
        setTagErrorMessage(t("tag_already_exists_for_user"));
      } else {
        setTagErrorMessage(t("error_creating_tag_generic"));
      }
    } finally {
      setIsCreatingTag(false);
    }
  };

  function tagButtonClickHandler(tagId: string) {
    setSelectedTags((prevSelectedTags) => {
      const isSelected = prevSelectedTags.includes(tagId);
      if (isSelected) {
        return prevSelectedTags.filter((t: string) => t !== tagId);
      } else {
        return [...prevSelectedTags, tagId];
      }
    });
  }

  async function deleteTagHandler(tagToDelete: Tag) {
    try {
      await service.deleteTag(tagToDelete.id);
      setAvailableTags((prevAvailableTags) =>
        prevAvailableTags.filter((tag) => tag.id !== tagToDelete.id)
      );
      setSelectedTags((prevSelectedTags) =>
        prevSelectedTags.filter((tagId) => tagId !== tagToDelete.id)
      );
      alert(t("tag_deleted_success", { tagName: t(tagToDelete.name) }));
    } catch (error) {
      console.error(`Erro ao apagar a tag ${tagToDelete.name}:`, error);
      alert(t("error_deleting_tag", { tagName: t(tagToDelete.name) }));
    }
  }

  return (
    <div className={styles.tagsSectionContainer}>
      <h2 className={styles.formSectionTitle}>{t("tags_title")}</h2>
      <div className={styles.tagsContent}>
        <div className={styles.tagListAndCreateContainer}>
          {availableTags.length > 0 && (
            <div className={styles.tagListContainer}>
              {availableTags.map((tag: Tag) => (
                <div
                  key={tag.id}
                  className={classNames(styles.tagItem, {
                    [styles.selectedTagItem]: selectedTags.includes(tag.id),
                  })}
                  onClick={() => tagButtonClickHandler(tag.id)}
                >
                  <span className={styles.tagLabel}>{t(tag.name)}</span>
                  <Button
                    onPress={() => {
                      deleteTagHandler(tag);
                    }}
                    className={styles.deleteTagButton}
                    aria-label={t("delete_tag_aria_label", {
                      tagName: t(tag.name),
                    })}
                    title={t("delete_tag_title", { tagName: t(tag.name) })}
                  >
                    &times;
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.createTagInputAndButtonContainer}>
            <Input
              className={styles.createTagInput}
              value={newTagNameInput}
              onChange={(e) => setNewTagNameInput(e.target.value)}
              placeholder={t("new_tag_name_placeholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreatingTag) {
                  e.preventDefault();
                  handleCreateTag();
                }
              }}
              isDisabled={isCreatingTag}
            />
            <Button
              className={styles.addTagButtonRound}
              onPress={handleCreateTag}
              isDisabled={isCreatingTag || !newTagNameInput.trim()}
            >
              +
            </Button>
          </div>
        </div>

        {isCreatingTag && (
          <p className={styles.creatingTagMessage}>
            {t("creating_tag_message")}
          </p>
        )}
        {tagErrorMessage && (
          <p className={styles.tagErrorMessage}>{tagErrorMessage}</p>
        )}
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
  notes,
  setNotes,
  selectedCustomColor,
  setSelectedCustomColor,
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
  notes: string;
  setNotes: (notes: string) => void;
  selectedCustomColor: string;
  setSelectedCustomColor: (color: string) => void;
}) {
  const { t } = useTranslation("calendar");
  return (
    <div className={styles.newEventForm}>
      <TitleSection title={newEventTitle} setTitle={setNewEventTitle} />
      <DateSection
        newEventStartDate={newEventStartDate}
        setNewEventStartDate={setNewEventStartDate}
        newEventEndDate={newEventEndDate}
        setNewEventEndDate={setNewEventEndDate}
      />
      <NotesSection notes={notes} setNotes={setNotes} />
      <IsRecurrentSection
        recurrenceType={recurrenceType}
        setRecurrenceType={setRecurrenceType}
      />
      <TagSection
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
      />
      <ColorPickerInput
        label={t("custom_color_label")}
        color={selectedCustomColor}
        setColor={setSelectedCustomColor}
        clearColor={() => setSelectedCustomColor("#3399FF")}
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
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("none");
  const [notes, setNotes] = useState<string>("");
  const [allAvailableTags, setAllAvailableTags] = useState<Tag[]>([]);
  const [selectedCustomColor, setSelectedCustomColor] =
    useState<string>("#3399FF");
  const { t } = useTranslation("calendar");

  const fetchTagsForMapping = useCallback(async () => {
    try {
      const fetchedTags = await service.fetchUserTags();
      setAllAvailableTags(fetchedTags);
    } catch (error) {
      console.error("Erro ao buscar tags para mapeamento:", error);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      fetchTagsForMapping();
    }
  }, [isModalOpen, fetchTagsForMapping]);

  function clearFields() {
    setNewEventTitle("");
    setSelectedTags([]);
    setNewEventStartDate(new Date());
    setNewEventEndDate(new Date(new Date().getTime() + 60 * 1000)); // Adiciona 1 minuto
    setRecurrenceType("none");
    setNotes("");
    setSelectedCustomColor("#3399FF");
  }

  const finishCreatingEventButtonDisabled = !newEventTitle;

  function createNewEventClickHandler() {
    const everyWeek = recurrenceType === "weekly";
    const everyDay = recurrenceType === "daily";

    const tagNamesToSend = selectedTags
      .map((tagId) => {
        const foundTag = allAvailableTags.find((tag) => tag.id === tagId);
        return foundTag ? foundTag.name : "";
      })
      .filter((name) => name !== "");

    service
      .createNewEvent({
        title: newEventTitle,
        startDate: newEventStartDate,
        endDate: newEventEndDate,
        tags: tagNamesToSend,
        everyWeek: everyWeek,
        everyDay: everyDay,
        notes: notes,
        color: selectedCustomColor,
      })
      .then(() => {
        clearFields();
        refreshUserEvents();
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error("Erro ao criar evento:", error);
        alert(t("error_creating_event"));
      });
  }

  return (
    <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog aria-label={t("new_event_modal_title")}>
        {({ close }) => (
          <div className={styles.newEventModalContainer}>
            <Button
              className={classNames(styles.roundButton, styles.closeButton)}
              onPress={() => {
                console.log("CreateEventModal: Botão fechar pressionado.");
                clearFields();
                close();
              }}
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
                notes={notes}
                setNotes={setNotes}
                selectedCustomColor={selectedCustomColor}
                setSelectedCustomColor={setSelectedCustomColor}
              />
            </div>
            <div className={styles.finishCreatingEventButtonContainer}>
              <Button
                className={classNames(styles.finishCreatingEventButton)}
                isDisabled={finishCreatingEventButtonDisabled}
                onPress={() => {
                  console.log(
                    "CreateEventModal LOG: Botão Confirmar pressionado."
                  );
                  createNewEventClickHandler();
                  close();
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
