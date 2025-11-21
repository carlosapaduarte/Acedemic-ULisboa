import React, { useEffect, useState } from "react";
import styles from "../createTask.module.css";
import {
  Button,
  Dialog,
  DialogTrigger,
  Input,
  Label,
  Popover,
  TextField,
} from "react-aria-components";
import { SlotToWork } from "~/routes/tasks/CreateTask/SlotToWork/SlotToWork";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { SlotToWorkDto } from "~/service/output_dtos";
import { CreateTagModal } from "~/components/TagsModal/CreateTagModal";
import { Tag } from "~/service/service";
import { RiSettings5Fill } from "react-icons/ri";

const priorityValues = ["low", "medium", "high"];

const TitleSection = React.memo(function TitleSection({
  title,
  setTitle,
}: {
  title: string | undefined;
  setTitle: (title: string) => void;
}) {
  const { t } = useTranslation(["task"]);
  return (
    <div className={styles.titleSectionContainer}>
      <TextField className={styles.formTextField} autoFocus>
        <Label className={styles.formSectionTitle}>
          {t("task:title_label")}
        </Label>
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

const DescriptionSection = React.memo(function DescriptionSection({
  description,
  setDescription,
}: {
  description: string | undefined;
  setDescription: (description: string) => void;
}) {
  const { t } = useTranslation(["task"]);
  return (
    <div className={styles.titleSectionContainer}>
      <TextField className={styles.formTextField}>
        <Label className={styles.formSectionTitle}>
          {t("task:description_label")}
        </Label>
        <Input
          className={styles.formInput}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </TextField>
    </div>
  );
});

const SlotsToWorkSection = React.memo(function SlotsToWorkSection({
  slotsToWork,
  setSlotsToWork,
}: {
  slotsToWork: SlotToWorkDto[];
  setSlotsToWork: (slotsToWork: SlotToWorkDto[]) => void;
}) {
  const { t } = useTranslation(["task"]);
  const [slotAddingQueue, setSlotAddingQueue] = useState<number[]>([]);

  const [slotsToWorkNumber, setSlotsToWorkNumber] = useState(
    slotsToWork.length
  );

  function addToSlotAddingQueue(index: number) {
    setSlotAddingQueue((slotAddingQueue) => [...slotAddingQueue, index]);
    setTimeout(() => {
      setSlotAddingQueue((slotAddingQueue) =>
        slotAddingQueue.filter((i) => i !== index)
      );
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
              } else console.log("Invalid date");
            }}
          />
        ))}
      </div>
      <Button
        onPress={() => {
          setSlotsToWorkNumber(slotsToWorkNumber + 1);
          addToSlotAddingQueue(slotsToWorkNumber);
        }}
        className={classNames(styles.addSlotToWorkButton)}
      >
        {t("task:add_slot_to_work")}
      </Button>
    </div>
  );
});

const DeadlineSection = React.memo(function DeadlineSection({
  deadline,
  setDeadline,
}: {
  deadline: Date | undefined;
  setDeadline: (deadline: Date | undefined) => void;
}) {
  const { t } = useTranslation(["task"]);

  const [date, setDate] = useState<string>(
    deadline?.toISOString().split("T")[0] ?? ""
  );
  const [time, setTime] = useState<string>(
    deadline?.toISOString().split("T")[1].split(".")[0] ?? ""
  );

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
      <h2 className={styles.formSectionTitle}>{t("task:deadline_label")}</h2>
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

const PrioritySection = React.memo(function PrioritySection({
  priority,
  setPriority,
}: {
  priority: string | undefined;
  setPriority: (priority: string) => void;
}) {
  const { t } = useTranslation(["task"]);

  function priorityButtonClickHandler(
    event: React.MouseEvent<HTMLButtonElement>,
    priority: string
  ) {
    event?.preventDefault();

    setPriority(priority);
  }

  return (
    <div className={styles.prioritySectionContainer}>
      <h1 className={styles.formSectionTitle}>{t("task:priority_label")}</h1>
      <div className={styles.priorityValuesContainer}>
        {priorityValues.map((priorityValue, index) => (
          <button
            key={index}
            aria-selected={priority === priorityValue}
            onClick={(e) => priorityButtonClickHandler(e, priorityValue)}
            className={classNames(
              styles.priorityButton,
              styles[`${priorityValue}Priority`]
            )}
          >
            {t(`task:priority_option_${priorityValue}`)}
          </button>
        ))}
      </div>
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
  const { t, i18n } = useTranslation(["task"]);

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

            let displayName: string | undefined | null;
            if (
              tag.name &&
              ["fun", "work", "personal", "study"].includes(tag.name)
            ) {
              displayName = t(tag.name);
            } else {
              const lang = i18n.language.toLowerCase();
              displayName =
                lang.startsWith("en") && tag.name_en
                  ? tag.name_en
                  : tag.name_pt;
            }

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

export function CreateTaskForm({
  description,
  setDescription,
  slotsToWork,
  setSlotsToWork,
  deadline,
  setDeadline,
  title,
  setTitle,
  priority,
  setPriority,
  selectedTagIds,
  setSelectedTagIds,
  availableTags,
  refreshTags,
  setIsEditTagModalOpen,
  isMicroTask,
  setIsMicroTask,
}: {
  description: string | undefined;
  setDescription: (description: string) => void;
  slotsToWork: SlotToWorkDto[];
  setSlotsToWork: (slotsToWork: SlotToWorkDto[]) => void;
  deadline: Date | undefined;
  setDeadline: (deadline: Date | undefined) => void;
  title: string | undefined;
  setTitle: (title: string) => void;
  priority: string | undefined;
  setPriority: (priority: string) => void;
  selectedTagIds: string[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  availableTags: Tag[];
  refreshTags: () => void;
  setIsEditTagModalOpen: (isOpen: boolean) => void;
  isMicroTask: boolean;
  setIsMicroTask: (isMicroTask: boolean) => void;
}) {
  return (
    <form className={styles.newTaskForm}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <input
          type="checkbox"
          id="micro-task-checkbox"
          checked={isMicroTask}
          onChange={(e) => setIsMicroTask(e.target.checked)}
          style={{ width: "1.2rem", height: "1.2rem" }}
        />
        <label
          htmlFor="micro-task-checkbox"
          style={{
            fontFamily: "var(--font-family1)",
            fontSize: "1rem",
            color: "var(--text-color-1)",
          }}
        >
          Micro-tarefa
        </label>
        <span
          title="Tarefas rápidas sem detalhes ou slots de tempo"
          style={{ cursor: "help", fontSize: "0.9rem" }}
        >
          ℹ️
        </span>
      </div>
      <TitleSection title={title} setTitle={setTitle} />
      <DescriptionSection
        description={description}
        setDescription={setDescription}
      />
      <SlotsToWorkSection
        slotsToWork={slotsToWork}
        setSlotsToWork={setSlotsToWork}
      />
      <DeadlineSection deadline={deadline} setDeadline={setDeadline} />
      <PrioritySection priority={priority} setPriority={setPriority} />
      <TagSection
        selectedTagIds={selectedTagIds}
        setSelectedTagIds={setSelectedTagIds}
        availableTags={availableTags}
        refreshTags={refreshTags}
        setIsEditTagModalOpen={setIsEditTagModalOpen}
      />
    </form>
  );
}
