import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  Input,
  Label,
  Modal,
  TextField,
} from "react-aria-components";
import classNames from "classnames";
import { service } from "../../../service/service";
import { ColorPickerInput } from "~/components/ColorPickerInput/ColorPickerInput";

import styles from "./EventModal.module.css";

interface Tag {
  id: string;
  name: string;
  user_id: number;
}

export interface EventData {
  id: number;
  title: string;
  start: Date;
  end: Date;
  tags: string[];
  notes?: string;
  color?: string;
  everyDay?: boolean;
  everyWeek?: boolean;
}

export type RecurrenceType = "none" | "daily" | "weekly";

interface EventModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  refreshUserEvents: () => void;
  eventToEdit?: EventData | null;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

const TitleSection = React.memo(function TitleSection({
  title,
  setTitle,
}: {
  title: string;
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

const NotesSection = React.memo(function NotesSection({
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

const DateSection = React.memo(function DateSection({
  eventStartDate,
  setEventStartDate,
  eventEndDate,
  setEventEndDate,
}: {
  eventStartDate: Date;
  setEventStartDate: (startDate: Date) => void;
  eventEndDate: Date;
  setEventEndDate: (endDate: Date) => void;
}) {
  const { t } = useTranslation("calendar");

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const formatTime = (date: Date) => date.toTimeString().slice(0, 5);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split("-").map(Number);
    const newStartDate = new Date(eventStartDate);
    newStartDate.setFullYear(year, month - 1, day);
    setEventStartDate(newStartDate);
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newStartDate = new Date(eventStartDate);
    newStartDate.setHours(hours, minutes);
    setEventStartDate(newStartDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split("-").map(Number);
    const newEndDate = new Date(eventEndDate);
    newEndDate.setFullYear(year, month - 1, day);
    setEventEndDate(newEndDate);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newEndDate = new Date(eventEndDate);
    newEndDate.setHours(hours, minutes);
    setEventEndDate(newEndDate);
  };

  return (
    <div className={styles.dateSectionContainer}>
      <div className={styles.deadlineInputsContainer}>
        <TextField className={styles.formTextField}>
          <Label className={styles.formSectionTitle}>
            {t("start_date_label")}
          </Label>
          <Input
            type={"date"}
            value={formatDate(eventStartDate)}
            onChange={handleStartDateChange}
            className={classNames(styles.dateInput)}
          />
        </TextField>
        <TextField className={styles.formTextField}>
          <Label className={styles.formSectionTitle}>
            {t("start_time_label")}
          </Label>
          <Input
            type={"time"}
            value={formatTime(eventStartDate)}
            onChange={handleStartTimeChange}
            className={classNames(styles.timeInput)}
          />
        </TextField>
        <TextField className={styles.formTextField}>
          <Label className={styles.formSectionTitle}>
            {t("end_date_label")}
          </Label>
          <Input
            type={"date"}
            value={formatDate(eventEndDate)}
            onChange={handleEndDateChange}
            className={classNames(styles.dateInput)}
          />
        </TextField>
        <TextField className={styles.formTextField}>
          <Label className={styles.formSectionTitle}>
            {t("end_time_label")}
          </Label>
          <Input
            type={"time"}
            value={formatTime(eventEndDate)}
            onChange={handleEndTimeChange}
            className={classNames(styles.timeInput)}
          />
        </TextField>
      </div>
    </div>
  );
});

const IsRecurrentSection = React.memo(function IsRecurrentSection({
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
            {" "}
            {t(option.labelKey)}{" "}
          </option>
        ))}
      </select>
    </div>
  );
});

const TagSection = React.memo(function TagSection({
  selectedTagIds,
  setSelectedTagIds,
  availableTags,
  setAvailableTags,
}: {
  selectedTagIds: string[];
  setSelectedTagIds: (ids: string[]) => void;
  availableTags: Tag[];
  setAvailableTags: React.Dispatch<React.SetStateAction<Tag[]>>;
}) {
  const { t } = useTranslation("calendar");
  const [newTagNameInput, setNewTagNameInput] = useState<string>("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagErrorMessage, setTagErrorMessage] = useState<string | null>(null);

  const handleCreateTag = async () => {
    if (!newTagNameInput.trim()) {
      setTagErrorMessage(t("tag_name_cannot_be_empty"));
      return;
    }
    setIsCreatingTag(true);
    setTagErrorMessage(null);
    try {
      const newTag = await service.createTag(newTagNameInput);
      setAvailableTags((prev) => [...prev, newTag]);
      setSelectedTagIds((prev) => [...prev, newTag.id]);
      setNewTagNameInput("");
    } catch (error: any) {
      console.error("Erro ao criar tag:", error);
      setTagErrorMessage(t("error_creating_tag_generic"));
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleDeleteTag = async (tagToDelete: Tag, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        t("tag_delete_confirmation", { tagName: t(tagToDelete.name) })
      )
    ) {
      return;
    }
    try {
      await service.deleteTag(tagToDelete.id);
      setAvailableTags((prev) =>
        prev.filter((tag) => tag.id !== tagToDelete.id)
      );
      setSelectedTagIds((prev) => prev.filter((id) => id !== tagToDelete.id));
    } catch (error) {
      console.error(`Erro ao apagar a tag ${tagToDelete.name}:`, error);
      alert(t("error_deleting_tag", { tagName: t(tagToDelete.name) }));
    }
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

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
                    [styles.selectedTagItem]: selectedTagIds.includes(tag.id),
                  })}
                  onClick={() => toggleTagSelection(tag.id)}
                >
                  <span className={styles.tagLabel}>{t(tag.name)}</span>
                  <Button
                    onPress={(e) => handleDeleteTag(tag, e as any)}
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
              disabled={isCreatingTag}
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
        {tagErrorMessage && (
          <p className={styles.tagErrorMessage}>{tagErrorMessage}</p>
        )}
      </div>
    </div>
  );
});

const EventForm = (props: any) => {
  return (
    <div className={styles.newEventForm}>
      <TitleSection title={props.title} setTitle={props.setTitle} />
      <DateSection
        eventStartDate={props.startDate}
        setEventStartDate={props.setStartDate}
        eventEndDate={props.endDate}
        setEventEndDate={props.setEndDate}
      />
      <NotesSection notes={props.notes} setNotes={props.setNotes} />
      <IsRecurrentSection
        recurrenceType={props.recurrenceType}
        setRecurrenceType={props.setRecurrenceType}
      />
      <TagSection
        selectedTagIds={props.selectedTagIds}
        setSelectedTagIds={props.setSelectedTagIds}
        availableTags={props.availableTags}
        setAvailableTags={props.setAvailableTags}
      />
      <ColorPickerInput
        label={props.label}
        color={props.color}
        setColor={props.setColor}
        clearColor={() => props.setColor("#3399FF")}
      />
    </div>
  );
};

export function EventModal({
  isModalOpen,
  setIsModalOpen,
  refreshUserEvents,
  eventToEdit,
  initialStartDate = new Date(),
  initialEndDate = new Date(Date.now() + 60 * 60 * 1000),
}: EventModalProps) {
  console.log("Dados recebidos em eventToEdit:", eventToEdit);

  const { t } = useTranslation("calendar");
  const isEditMode = !!eventToEdit;

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState("#3399FF");
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("none");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const initializeForm = async () => {
      try {
        const fetchedTags = await service.fetchUserTags();
        setAvailableTags(fetchedTags);

        if (eventToEdit) {
          //preenche o formulário com os dados do evento
          setTitle(eventToEdit.title ?? "");
          setStartDate(new Date(eventToEdit.start));
          setEndDate(new Date(eventToEdit.end));
          setNotes(eventToEdit.notes || "");
          setColor(eventToEdit.color || "#3399FF");

          if (eventToEdit.everyDay) setRecurrenceType("daily");
          else if (eventToEdit.everyWeek) setRecurrenceType("weekly");
          else setRecurrenceType("none");

          const tagIdsToSelect = eventToEdit.tags
            .map((tagName) => fetchedTags.find((t) => t.name === tagName)?.id)
            .filter((id): id is string => !!id);

          setSelectedTagIds(tagIdsToSelect);
        } else {
          setTitle("");
          setStartDate(initialStartDate);
          setEndDate(initialEndDate);
          setNotes("");
          setColor("#3399FF");
          setRecurrenceType("none");
          setSelectedTagIds([]);
        }
      } catch (err) {
        console.error("Erro ao inicializar o formulário do evento:", err);
        setAvailableTags([]);
        setSelectedTagIds([]);
      }
    };

    initializeForm();
  }, [isModalOpen, eventToEdit]);

  const clearFormAndClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!title) {
      alert(t("title_is_required"));
      return;
    }

    const tagIdsToSend = selectedTagIds.slice();
    const eventPayload = {
      title,
      startDate,
      endDate,
      notes,
      color,
      tags: tagIdsToSend,
      everyDay: recurrenceType === "daily",
      everyWeek: recurrenceType === "weekly",
    };

    setSaving(true);
    try {
      if (isEditMode && eventToEdit) {
        await service.updateEvent(eventToEdit.id, eventPayload);
      } else {
        await service.createNewEvent(eventPayload);
      }
      refreshUserEvents();
      clearFormAndClose();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert(t("error_saving_event"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !eventToEdit) return;
    if (window.confirm(t("confirm_delete_event"))) {
      setSaving(true);
      try {
        await service.deleteEvent(eventToEdit.id);
        refreshUserEvents();
        clearFormAndClose();
      } catch (error) {
        console.error("Erro ao apagar evento:", error);
        alert(t("error_deleting_event_generic"));
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
      <Dialog
        aria-label={t(
          isEditMode ? "edit_event_modal_title" : "new_event_modal_title"
        )}
      >
        {() => (
          <div className={styles.newEventModalContainer}>
            <Button
              className={classNames(styles.roundButton, styles.closeButton)}
              onPress={clearFormAndClose}
              isDisabled={saving}
            >
              {t("close_button")}
            </Button>
            <h1 className={styles.newEventTitleText}>
              {t(
                isEditMode ? "edit_event_modal_title" : "new_event_modal_title"
              )}
            </h1>
            <div className={styles.newEventFormContainer}>
              <EventForm
                title={title}
                setTitle={setTitle}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                notes={notes}
                setNotes={setNotes}
                recurrenceType={recurrenceType}
                setRecurrenceType={setRecurrenceType}
                selectedTagIds={selectedTagIds}
                setSelectedTagIds={setSelectedTagIds}
                availableTags={availableTags}
                setAvailableTags={setAvailableTags}
                color={color}
                setColor={setColor}
                label={t("custom_color_label")}
              />
            </div>
            <div className={styles.finishCreatingEventButtonContainer}>
              {isEditMode && (
                <Button
                  className={classNames(styles.deleteEventButton)}
                  onPress={handleDelete}
                  isDisabled={saving}
                >
                  {t("delete_button")}
                </Button>
              )}
              <Button
                className={classNames(styles.finishCreatingEventButton)}
                isDisabled={!title || saving}
                onPress={handleSave}
              >
                {saving
                  ? t("saving_label")
                  : t(isEditMode ? "save_button" : "confirm_button")}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </Modal>
  );
}
