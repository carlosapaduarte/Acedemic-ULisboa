import styles from "~/routes/tasks/tasksPage.module.css";

const statusValues: string[] = [
    "Tarefa Completa",
    "Tarefa completa, mas precisa de alguns ajustes ou revisão",
    "Tarefa parcialmente completa",
    "Tarefa incompleta",
    "Tarefa não iniciada"
];

export function StatusPicker({ onStatusSelect }: { onStatusSelect: (status: string) => void }) {
    return (
        <div>
            <h1 className={styles.createTaskTitle}>Select Status:</h1>
            {statusValues.map((status: string, index: number) =>
                <div key={index}>
                    <button onClick={() => onStatusSelect(status)}>
                        {status}
                    </button>
                </div>
            )}
        </div>
    );
}

