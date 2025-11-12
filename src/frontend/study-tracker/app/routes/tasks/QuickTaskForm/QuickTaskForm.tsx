import { useState } from "react";
import { useTranslation } from "react-i18next";
import { service } from "~/service/service";
import styles from "./quickTaskForm.module.css";
import { Button } from "react-aria-components";

interface QuickTaskFormProps {
  onTaskCreated: () => void;
}

export function QuickTaskForm({ onTaskCreated }: QuickTaskFormProps) {
  const { t } = useTranslation(["task"]);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      await service.createNewTask({
        title: title,
        description: "",
        deadline: undefined,
        priority: "low",
        tags: [],
        status: "not_completed",
        subTasks: [],
        slotsToWork: [],
        is_micro_task: true,
        //curricular_unit_name: undefined,
      });

      setTitle("");
      onTaskCreated();
    } catch (error) {
      console.error("Erro ao criar micro-tarefa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.quickTaskForm} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.quickTaskInput}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("task:quick_task_placeholder", "Ex: Ligar à avó...")}
        disabled={isSubmitting}
      />
      <Button
        type="submit"
        className={styles.quickTaskButton}
        isDisabled={isSubmitting || !title.trim()}
      >
        +
      </Button>
    </form>
  );
}
