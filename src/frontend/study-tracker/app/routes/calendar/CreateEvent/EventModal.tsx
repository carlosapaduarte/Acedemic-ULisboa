import React, { useEffect, useState } from "react";
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
import { service, Tag } from "../../../service/service";
import { ColorPickerInput } from "~/components/ColorPickerInput/ColorPickerInput";
import { EditTagModal } from "../../../components/TagsModal/EditTagModal";
import { CreateTagModal } from "../../../components/TagsModal/CreateTagModal";
import styles from "./EventModal.module.css";
import { TagSection } from "~/components/TagSection/TagSection";

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
  is_uc?: boolean;
  task_id?: number;
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

const TitleSection = React.memo(({ title, setTitle }: any) => {
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
        />
      </TextField>
    </div>
  );
});
const NotesSection = React.memo(({ notes, setNotes }: any) => {
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
const IsRecurrentSection = React.memo(
  ({ recurrenceType, setRecurrenceType }: any) => {
    const { t } = useTranslation("calendar");
    return (
      <div className={styles.recurrentEventSectionContainer}>
        <h2 className={styles.formSectionTitle}>{t("recurrence_title")}</h2>
        <select
          className={styles.nativeSelect}
          value={recurrenceType}
          onChange={(e) => setRecurrenceType(e.target.value)}
        >
          <option value="none">{t("recurrence_none_label")}</option>
          <option value="daily">{t("recurrence_daily_label")}</option>
          <option value="weekly">{t("recurrence_weekly_label")}</option>
        </select>
      </div>
    );
  }
);
const DateSection = React.memo(
  ({
    eventStartDate,
    setEventStartDate,
    eventEndDate,
    setEventEndDate,
  }: any) => {
    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    const formatTime = (d: Date) => d.toTimeString().slice(0, 5);
    return (
      <div className={styles.dateSectionContainer}>
        <div className={styles.deadlineInputsContainer}>
          <input
            type="date"
            className={styles.dateInput}
            value={formatDate(eventStartDate)}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m, d] = e.target.value.split("-").map(Number);
              const n = new Date(eventStartDate);
              n.setFullYear(y, m - 1, d);
              setEventStartDate(n);
            }}
          />
          <input
            type="time"
            className={styles.timeInput}
            value={formatTime(eventStartDate)}
            onChange={(e) => {
              if (!e.target.value) return;
              const [h, m] = e.target.value.split(":").map(Number);
              const n = new Date(eventStartDate);
              n.setHours(h, m);
              setEventStartDate(n);
            }}
          />
          <input
            type="date"
            className={styles.dateInput}
            value={formatDate(eventEndDate)}
            onChange={(e) => {
              if (!e.target.value) return;
              const [y, m, d] = e.target.value.split("-").map(Number);
              const n = new Date(eventEndDate);
              n.setFullYear(y, m - 1, d);
              setEventEndDate(n);
            }}
          />
          <input
            type="time"
            className={styles.timeInput}
            value={formatTime(eventEndDate)}
            onChange={(e) => {
              if (!e.target.value) return;
              const [h, m] = e.target.value.split(":").map(Number);
              const n = new Date(eventEndDate);
              n.setHours(h, m);
              setEventEndDate(n);
            }}
          />
        </div>
      </div>
    );
  }
);

const EventForm = (props: any) => {
  return (
    <div className={styles.newEventForm}>
      <TitleSection title={props.title} setTitle={props.setTitle} />
      <DateSection
        startDate={props.startDate}
        setStartDate={props.setStartDate}
        endDate={props.endDate}
        setEndDate={props.setEndDate}
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
      <ColorPickerInput
        label={props.label}
        color={props.color}
        setColor={props.setColor}
        clearColor={() => props.setColor(null)}
      />

      <TagSection
        selectedTagIds={props.selectedTagIds}
        setSelectedTagIds={props.setSelectedTagIds}
        availableTags={props.availableTags}
        refreshTags={props.refreshTags}
        onEditTags={() => props.setIsEditTagModalOpen(true)}
        onAddTag={() => props.setIsCreateTagModalOpen(true)}
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
  const { t } = useTranslation("calendar");
  const isEditMode = !!eventToEdit;
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("none");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);
  const [isCreateTagModalOpen, setIsCreateTagModalOpen] = useState(false);
  const [isUC, setIsUC] = useState(false);

  const refreshTags = async (newTag?: Tag) => {
    if (newTag) {
      setAvailableTags((p) => {
        if (p.some((t) => t.id === newTag.id)) return p;
        return [...p, newTag];
      });
      if (newTag.id) setSelectedTagIds((prev) => [...prev, newTag.id]);
    }
    try {
      const fresh = await service.fetchUserTags();
      setAvailableTags(Array.isArray(fresh) ? fresh : []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;
    service
      .fetchUserTags()
      .then((t) => setAvailableTags(Array.isArray(t) ? t : []))
      .catch(console.error);
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setStartDate(new Date(eventToEdit.start));
      setEndDate(new Date(eventToEdit.end));
      setNotes(eventToEdit.notes || "");
      setColor(eventToEdit.color || null);
      if (eventToEdit.everyDay) setRecurrenceType("daily");
      else if (eventToEdit.everyWeek) setRecurrenceType("weekly");
      else setRecurrenceType("none");
      setIsUC(eventToEdit.is_uc ?? false);
      setSelectedTagIds(eventToEdit.tags || []);
    } else {
      setTitle("");
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setNotes("");
      setColor(null);
      setRecurrenceType("none");
      setSelectedTagIds([]);
      setIsUC(false);
    }
  }, [isModalOpen, eventToEdit]);

  const clearFormAndClose = () => setIsModalOpen(false);

  const handleSave = async () => {
    setError(null);
    if (!title) {
      setError(t("title_is_required"));
      return;
    }
    if (endDate < startDate) {
      setError(t("end_date_before_start_date_error"));
      return;
    }

    const eventPayload = {
      title,
      startDate,
      endDate,
      notes,
      color: color || undefined,
      tags: selectedTagIds,
      everyDay: recurrenceType === "daily",
      everyWeek: recurrenceType === "weekly",
      is_uc: isUC,
    };

    setSaving(true);
    try {
      if (isEditMode && eventToEdit)
        await service.updateEvent(eventToEdit.id, eventPayload);
      else await service.createNewEvent(eventPayload);
      refreshUserEvents();
      clearFormAndClose();
    } catch (error) {
      console.error(error);
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
        await service.deleteEvent(Number(eventToEdit.id));
        refreshUserEvents();
        clearFormAndClose();
      } catch (error) {
        alert(t("error_deleting_event"));
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <>
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog aria-label="Event Modal">
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
                  isEditMode
                    ? "edit_event_modal_title"
                    : "new_event_modal_title"
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
                  color={color}
                  setColor={setColor}
                  label={t("custom_color_label")}
                  refreshTags={refreshTags}
                  setIsEditTagModalOpen={setIsEditTagModalOpen}
                  setIsCreateTagModalOpen={setIsCreateTagModalOpen}
                  isUC={isUC}
                  setIsUC={setIsUC}
                  t={t}
                />
              </div>
              {error && (
                <div className={styles.errorMessageContainer}>
                  <p>{error}</p>
                </div>
              )}
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

      <EditTagModal
        isOpen={isEditTagModalOpen}
        setIsOpen={setIsEditTagModalOpen}
        onTagsUpdate={refreshTags}
      />

      {/* MODAL DE CRIAR TAG (RESTABELECIDO) */}
      <Modal
        isOpen={isCreateTagModalOpen}
        onOpenChange={setIsCreateTagModalOpen}
      >
        <Dialog aria-label="Create Tag">
          {({ close }) => (
            <CreateTagModal close={close} onTagCreated={refreshTags} />
          )}
        </Dialog>
      </Modal>
    </>
  );
}
