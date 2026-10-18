import type { Task } from "~/service/service";

export type TaskTreeEntry = {
  task: Task;
  depth: number;
  ancestorIds: number[];
};

export function flattenTaskTree(tasks: Task[]): TaskTreeEntry[] {
  const entries: TaskTreeEntry[] = [];

  const visit = (task: Task, depth: number, ancestorIds: number[]) => {
    entries.push({ task, depth, ancestorIds });
    task.subTasks.forEach((subTask) =>
      visit(subTask, depth + 1, [...ancestorIds, task.id]),
    );
  };

  tasks.forEach((task) => visit(task, 0, []));
  return entries;
}

export function getSelectableTaskEntries(tasks: Task[]): TaskTreeEntry[] {
  return flattenTaskTree(tasks).filter(
    ({ task }) => task.data.status !== "completed",
  );
}

export function getSelectedTaskEntries(
  tasks: Task[],
  selectedTaskIds: number[],
): TaskTreeEntry[] {
  const selectedIds = new Set(selectedTaskIds);
  return getSelectableTaskEntries(tasks).filter(({ task }) =>
    selectedIds.has(task.id),
  );
}

function collectEligibleSubtreeIds(task: Task): number[] {
  const ids = task.data.status === "completed" ? [] : [task.id];
  return task.subTasks.reduce(
    (allIds, subTask) => [...allIds, ...collectEligibleSubtreeIds(subTask)],
    ids,
  );
}

export function toggleTaskSelection(
  tasks: Task[],
  selectedTaskIds: number[],
  taskId: number,
): number[] {
  const selectableIds = new Set(
    getSelectableTaskEntries(tasks).map(({ task }) => task.id),
  );
  const selectedIds = new Set(
    selectedTaskIds.filter((id) => selectableIds.has(id)),
  );
  const entries = flattenTaskTree(tasks);
  const clickedEntry = entries.find(({ task }) => task.id === taskId);

  if (!clickedEntry || !selectableIds.has(taskId)) {
    return Array.from(selectedIds);
  }

  const affectedIds = collectEligibleSubtreeIds(clickedEntry.task);

  if (selectedIds.has(taskId)) {
    affectedIds.forEach((id) => selectedIds.delete(id));
    clickedEntry.ancestorIds.forEach((id) => selectedIds.delete(id));
  } else {
    affectedIds.forEach((id) => selectedIds.add(id));
  }

  return Array.from(selectedIds);
}

export function getTrackedTaskIds(
  tasks: Task[],
  selectedTaskIds: number[],
): number[] {
  // Store each session once per selected branch, at its highest selected node.
  const selectableIds = new Set(
    getSelectableTaskEntries(tasks).map(({ task }) => task.id),
  );
  const selectedIds = new Set(
    selectedTaskIds.filter((id) => selectableIds.has(id)),
  );
  return getSelectableTaskEntries(tasks)
    .filter(
      ({ task, ancestorIds }) =>
        selectedIds.has(task.id) &&
        !ancestorIds.some((ancestorId) => selectedIds.has(ancestorId)),
    )
    .map(({ task }) => task.id);
}

export function getTotalPlannedMinutes(task: Task): number {
  return (
    task.data.planned_minutes +
    task.subTasks.reduce(
      (total, subTask) => total + getTotalPlannedMinutes(subTask),
      0,
    )
  );
}
