import React, { useContext, useEffect, useState } from "react";
import styles from "../createTask.module.css";
import {
  Button,
  Dialog,
  DialogTrigger,
  Input,
  Label,
  Popover,
  TextField,
  Modal,
} from "react-aria-components";
import { SlotToWork, ModalContent } from "~/routes/tasks/CreateTask/SlotToWork/SlotToWork";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { SlotToWorkDto } from "~/service/output_dtos";
import { CreateTagModal } from "~/components/TagsModal/CreateTagModal";
import { Tag } from "~/service/service";
import { RiSettings5Fill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "@remix-run/react";
import { TagSection } from "~/components/TagSection/TagSection";
import calendarStyles from "~/routes/calendar/CreateEvent/EventModal.module.css";
import { SecondModalContext } from "~/routes/tasks/CreateTask/SecondModalContext";
import slotStyles from "~/routes/tasks/CreateTask/SlotToWork/slotToWork.module.css";

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
  const { setIsSecondModalOpen, setSecondModalContent, setSecondModalClass } = useContext(SecondModalContext);

  const [localSlots, setLocalSlots] = useState<
    { id: string; data: SlotToWorkDto | undefined }[]
  >(() => slotsToWork.map((slot) => ({ id: crypto.randomUUID(), data: slot })));

  useEffect(() => {
    const currentValidCount = localSlots.filter(
      (s) => s.data !== undefined
    ).length;

    if (slotsToWork.length > 0 && slotsToWork.length !== currentValidCount) {
      setLocalSlots(
        slotsToWork.map((slot) => ({ id: crypto.randomUUID(), data: slot }))
      );
    }
  }, [slotsToWork]);

  useEffect(() => {
    const validSlots = localSlots
      .map((s) => s.data)
      .filter((slot): slot is SlotToWorkDto => slot !== undefined);

    if (JSON.stringify(validSlots) !== JSON.stringify(slotsToWork)) {
      setSlotsToWork(validSlots);
    }
  }, [localSlots]);

  const handleAddDirectly = () => {
    setSecondModalClass(slotStyles.slotToWorkModal);
    setSecondModalContent(
      <ModalContent
        index={localSlots.length}
        initialDate={undefined}
        initialStartTime={undefined}
        initialEndTime={undefined}
        onConfirm={(data) => {
          const [year, month, day] = data.date.split("-").map(Number);
          const [startH, startM] = data.start.split(":").map(Number);
          const [endH, endM] = data.end.split(":").map(Number);
          
          const startObj = new Date(year, month - 1, day, startH, startM);
          const endObj = new Date(year, month - 1, day, endH, endM);
          
          if (!isNaN(startObj.getTime()) && !isNaN(endObj.getTime())) {
            setLocalSlots((prev) => [
              ...prev,
              { id: crypto.randomUUID(), data: { start: startObj, end: endObj } },
            ]);
          }
        }}
        onCancel={() => {}} // Se cancelar, não fazemos nada e a caixa fantasma não é criada
      />
    );
    setIsSecondModalOpen(true);
  };

  const handleRemoveSlot = (idToRemove: string) => {
    setLocalSlots((prev) => prev.filter((slot) => slot.id !== idToRemove));
  };

  const handleUpdateSlotData = (idToUpdate: string, data: SlotToWorkDto) => {
    setLocalSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === idToUpdate) {
          return { ...slot, data: data };
        }
        return slot;
      })
    );
  };

  const slotsInfoText = t(
    "task:slots_to_work_info",
    "Define sessões de trabalho dedicadas a esta tarefa para organizar o teu dia.",
  );

  return (
    <div className={styles.slotsToWorkSectionContainer}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <h2 className={styles.formSectionTitle} style={{ margin: 0 }}>
          {t("task:slots_to_work_label")}
        </h2>
        <div
          className={styles.infoIcon}
          title={slotsInfoText}
          aria-label={slotsInfoText}
          role="note"
        >
          i
        </div>
      </div>
      <div className={styles.slotsToWorkContainer}>
        {localSlots.map((slotWrapper, index) => (
          <div
            key={slotWrapper.id}
            style={{ position: "relative", width: "100%" }}
          >
            <SlotToWork
              index={index}
              initialData={slotWrapper.data}
              onClosePressed={(data: SlotToWorkDto | undefined) => {
                if (data) {
                  handleUpdateSlotData(slotWrapper.id, data);
                }
              }}
            />

            <Button
              onPress={() => handleRemoveSlot(slotWrapper.id)}
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                background: "rgba(0,0,0,0.5)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 10,
              }}
              aria-label="Remover sessão"
            >
              <FaTrash size={12} />
            </Button>
          </div>
        ))}
      </div>
      <Button
        onPress={handleAddDirectly}
        className={classNames(styles.addSlotToWorkButton)}
      >
        {t("task:add_slot_to_work", "Adicionar Sessão de Trabalho")}
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
            aria-pressed={priority === priorityValue}
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
  setIsCreateTagModalOpen,
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
  setIsCreateTagModalOpen: (isOpen: boolean) => void;
  isMicroTask: boolean;
  setIsMicroTask: (isMicroTask: boolean) => void;
}) {
  const { t } = useTranslation(["task"]);
  
  const microTaskInfoText = t(
    "task:title_micro_task_info",
    "Uma micro-tarefa é uma tarefa rápida que não requer planeamento de blocos de tempo."
  );

  return (
    <form className={styles.newTaskForm}>
      <div className={styles.microTaskContainer}>
        <input
          type="checkbox"
          checked={isMicroTask}
          onChange={(e) => setIsMicroTask(e.target.checked)}
        />
        <label>{t("task:micro_task_label")}</label>
        <div
          className={styles.infoIcon}
          title={microTaskInfoText}
          aria-label={microTaskInfoText}
          role="note"
          onClick={() => {
            if (window.matchMedia("(max-width: 768px)").matches) {
              alert(microTaskInfoText);
            }
          }}
          style={{ cursor: "pointer", marginLeft: "8px" }}
        >
          i
        </div>
      </div>

      <TitleSection title={title} setTitle={setTitle} />

      {!isMicroTask && (
        <>
          <DescriptionSection description={description} setDescription={setDescription} />
          <SlotsToWorkSection slotsToWork={slotsToWork} setSlotsToWork={setSlotsToWork} />
          <DeadlineSection deadline={deadline} setDeadline={setDeadline} />
          <PrioritySection priority={priority} setPriority={setPriority} />
          
          <TagSection
            selectedTagIds={selectedTagIds}
            setSelectedTagIds={setSelectedTagIds}
            availableTags={availableTags}
            refreshTags={refreshTags}
            onEditTags={() => setIsEditTagModalOpen(true)}
            onAddTag={() => setIsCreateTagModalOpen(true)}
          />
        </>
      )}
    </form>
  );
}