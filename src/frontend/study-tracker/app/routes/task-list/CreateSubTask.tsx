import { useState } from "react"
import { SubTask } from "~/service/service"
import { StatusPicker } from "./commons"

function useCreateSubTask() {
    const [title, setTitle] = useState<string | undefined>(undefined)
    const [status, setStatus] = useState<string | undefined>(undefined)

    function clearCachedValues() {
        setTitle(undefined)
        setStatus(undefined)
    }

    return {title, setTitle, status, setStatus, clearCachedValues}
}

export function CreateSubTask({onConfirm} : {onConfirm: (subTask: SubTask) => void}) {
    const {title, setTitle, status, setStatus, clearCachedValues} = useCreateSubTask()

    function onConfirmHandler(subTask: SubTask) {
        clearCachedValues()
        onConfirm(subTask)
    }

    return (
        <div>
            <h1>Create Sub Task:</h1>
            <label>Title: </label> <input value={title ? title : ""} onChange={e => setTitle(e.target.value)} />
            <StatusPicker onStatusSelect={setStatus} />
            {title && status ?
                <button onClick={() => onConfirmHandler({title, status})}>
                    Confirm Sub Task
                </button>
                :
                <></>
            }
            
        </div>
    )
}