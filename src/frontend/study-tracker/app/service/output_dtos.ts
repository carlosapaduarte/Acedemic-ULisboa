export type SlotToWorkDto = {
  start: Date;
  end: Date;
};

export type CreateTaskInputDto = {
  title: string;
  description: string | undefined;
  deadline: Date | undefined;
  priority: string;
  tags: string[];
  status: string;
  subTasks: CreateTaskInputDto[];
  slotsToWork: SlotToWorkDto[];
  is_micro_task?: boolean;
  parent_task_id?: number;
};
