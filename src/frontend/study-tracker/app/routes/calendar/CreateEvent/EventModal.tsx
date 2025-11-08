import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogTrigger,
  Input,
  Label,
  Modal,
  Popover,
  TextField,
} from "react-aria-components";
import classNames from "classnames";
import { service } from "../../../service/service";
import { ColorPickerInput } from "~/components/ColorPickerInput/ColorPickerInput";
import { EditTagModal } from "../../../components/TagsModal/EditTagModal";
import { CreateTagModal } from "../../../components/TagsModal/CreateTagModal";
import styles from "./EventModal.module.css";
import { RiSettings5Fill } from "react-icons/ri";
interface Tag {
  id: string;
  name_pt: string;
  name_en?: string;
  user_id: number;
  color?: string;
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
  is_uc?: boolean;
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
  isUC,
  setIsUC,
}: {
  title: string;
  setTitle: (title: string) => void;
  isUC: boolean;
  setIsUC: (isUC: boolean) => void;
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
      <label htmlFor="is-uc-checkbox" className={styles.isUcContainer}>
        <span className={styles.formSectionTitle}>
          {t("is_uc_label", "Is uc?")}
        </span>
        <input
          type="checkbox"
          id="is-uc-checkbox"
          checked={isUC}
          onChange={(e) => setIsUC(e.target.checked)}
          className={styles.nativeCheckbox}
        />
        <span className={styles.customCheckbox}></span>
      </label>
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

const TagSection = ({
  selectedTagIds,
  setSelectedTagIds,
  availableTags,
  refreshTags,
  setIsEditTagModalOpen,
}: {
  selectedTagIds: string[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  availableTags: Tag[];
  refreshTags: () => void;
  setIsEditTagModalOpen: (isOpen: boolean) => void;
}) => {
  const { t, i18n } = useTranslation("calendar");

  const handleToggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className={styles.tagsSectionContainer}>
      <div className={styles.tagsHeader}>
        <h2 className={styles.formSectionTitle}>{t("tags_title")}</h2>
        <div className={styles.tagButtonsContainer}>
          <Button
            onPress={() => setIsEditTagModalOpen(true)}
            className={styles.headerButton}
            aria-label={t("manage_tags", "Gerir etiquetas")}
          >
            <RiSettings5Fill size={18} />
          </Button>
        </div>
      </div>
      <div className={styles.tagsContent}>
        <div className={styles.tagListContainer}>
          {availableTags.map((tag: Tag) => {
            const isSelected = selectedTagIds.includes(tag.id);
            const lang = i18n.language.toLowerCase();
            const displayName =
              lang.startsWith("en") && tag.name_en ? tag.name_en : tag.name_pt;

            return (
              <div
                key={tag.id}
                className={classNames(styles.tagItem, {
                  [styles.selectedTagItem]: isSelected,
                })}
                onClick={() => handleToggleTag(tag.id)}
                style={{
                  backgroundColor: isSelected
                    ? tag.color || "#888888"
                    : "var(--color-2)",
                }}
              >
                <span className={styles.tagLabel}>{displayName}</span>
              </div>
            );
          })}
          <DialogTrigger>
            <Button
              className={styles.addTagButtonRound}
              aria-label={t("add_new_tag", "Adicionar nova etiqueta")}
            >
              +
            </Button>
            <Popover placement="bottom">
              <CreateTagModal onTagCreated={refreshTags} />
            </Popover>
          </DialogTrigger>
        </div>
      </div>
    </div>
  );
};

const EventForm = (props: any) => {
  return (
    <div className={styles.newEventForm}>
      <TitleSection
        title={props.title}
        setTitle={props.setTitle}
        isUC={props.isUC}
        setIsUC={props.setIsUC}
      />
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
        setIsEditTagModalOpen={props.setIsEditTagModalOpen}
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
  const FALLBACK_COLOR = "#3399FF";

  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  //const [color, setColor] = useState(FALLBACK_COLOR);
  const [color, setColor] = useState<string | null>(null);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("none");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [saving, setSaving] = useState(false);
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);
  const [isUC, setIsUC] = useState(false);

  const refreshTags = async () => {
    try {
      const freshTags = await service.fetchUserTags();
      setAvailableTags(freshTags);
    } catch (error) {
      console.error("Falha ao buscar tags atualizadas:", error);
    }
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const initializeForm = async () => {
      try {
        const fetchedTags = await service.fetchUserTags();
        setAvailableTags(fetchedTags);

        if (eventToEdit) {
          setTitle(eventToEdit.title ?? "");
          setStartDate(new Date(eventToEdit.start));
          setEndDate(new Date(eventToEdit.end));
          setNotes(eventToEdit.notes || "");
          setColor(eventToEdit.color || null);

          if (eventToEdit.everyDay) setRecurrenceType("daily");
          else if (eventToEdit.everyWeek) setRecurrenceType("weekly");
          else setRecurrenceType("none");

          setIsUC(eventToEdit.is_uc ?? false);

          const tagIdentifiers = eventToEdit.tags || [];
          const tagIdsToSelect = tagIdentifiers
            .map((identifier) => {
              const foundTag = fetchedTags.find(
                (t) =>
                  t.name_pt === identifier ||
                  t.name_en === identifier ||
                  t.id === identifier
              );
              return foundTag ? foundTag.id : null;
            })
            .filter((id): id is string => !!id);
          setSelectedTagIds(tagIdsToSelect);
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
      } catch (err) {
        console.error("Erro ao inicializar o formulário do evento:", err);
      }
    };
    initializeForm();
  }, [isModalOpen, eventToEdit?.id]);

  const clearFormAndClose = () => {
    setIsModalOpen(false);
  };

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
        await service.deleteEvent(Number(eventToEdit.id));
        refreshUserEvents();
        clearFormAndClose();
      } catch (error) {
        console.error("Erro ao apagar evento:", error);
        alert(t("error_deleting_event", { tagName: eventToEdit.title }));
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <>
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
    </>
  );
}
