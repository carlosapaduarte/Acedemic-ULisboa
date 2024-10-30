
export type CreateTaskInputDto = {
    title: string
    description: string | undefined
    deadline: Date | undefined
    priority: string
    tags: string[]
    status: string,
    subTasks: CreateTaskInputDto[]
}