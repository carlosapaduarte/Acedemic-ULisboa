import { SubTask, Task } from "~/service/service"

function SubTask({subTask} : {subTask: SubTask}) {
    return (
        <div>
            <p>Title: {subTask.title}</p>
            <p>Status: {subTask.status}</p>
        </div>
    )
}

function Tags({tags} : {tags: string[]}) {
    return (
        <div>
            <p>Tags:</p>
            {tags.map((tag: string, index: number) => 
                <p key={index}>{tag}</p>
            )}
        </div>
    )
}

export function TaskView({task} : {task: Task}) {

    function passedDeadline(): boolean {
        return task.deadline < new Date()
    }

    return (
        <div>
            <p>Title: {task.title}</p>
            <p>Description: {task.description}</p>
            {passedDeadline() ?
                <p>Passed Deadline!!!</p>
                :
                <></>
            }
            <p>Deadline: {task.deadline.getTime()}</p>
            <Tags tags={task.tags} />
            <p>Priority: {task.priority}</p>
            <p>Status: {task.status}</p>
            <br/>
            <h1>Sub Tasks:</h1>
            {task.subTasks.map((subTask: SubTask, index: number) => 
                <div key={index}>
                    <SubTask subTask={subTask} />
                    <br/>
                </div>
            )}
        </div>
    )
}