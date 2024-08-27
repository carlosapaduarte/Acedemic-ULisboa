import { useEffect, useState } from "react"
import { useSetError } from "~/components/error/ErrorContainer"
import { service } from "~/service/service"

type Category = {
    name: string,
    tags: string[]
}

const categories: Category[] = [
{
        name: "Estudo",
        tags: ["Revisão", "Leitura", "Exercícios / Prática", "Preparação de provas"]
    },
    {
        name: "Aulas",
        tags: ["Presencial", "Online", "Tutorias / Dúvidas", "Reposição"]
    },
    {
        name: "Trabalhos / Projetos",
        tags: ["Apresentação", "Entrega", "Reunião de Grupo"]
    },
    {
        name: "Pessoal",
        tags: ["Aniversário", "Lazer", "Saúde"]
    }
]

export type AddNewTaskInfo = {
	date: Date,
	hour: number | undefined
}

export function AddTask({addNewTaskInfo, onNewTaskCreated} : {addNewTaskInfo: AddNewTaskInfo, onNewTaskCreated: () => void}) {
	const { title, hour, tag, setTitle, setHour, setTag, createNewTask } = useAddTask(addNewTaskInfo, onNewTaskCreated)

    let confirmButtonDom = <></>
    if (title.length > 0  && hour != undefined && tag != undefined)
        confirmButtonDom = 
            <button onClick={() => createNewTask(title, hour, tag)}>
                Confirm!
            </button>

	return (
		<div>
			<label>Title</label>
			<br/>
			<input value={title} placeholder="New task..." onChange={e => setTitle(e.target.value)} />
			<HourPicker hour={hour} onHourChange={setHour}/>
            <CategoryAndTagPicker onTagClick={setTag}/>
            {confirmButtonDom}
		</div>
	)
}

function useAddTask(addNewTaskInfo: AddNewTaskInfo, onNewTaskCreated: () => void) {
    const setError = useSetError();    
    
    const [title, setTitle] = useState<string>("")
	
    const receivedHour = addNewTaskInfo.hour
    const [hour, setHour] = useState<number | undefined>(receivedHour != undefined ? receivedHour : 0)
    const [tag, setTag] = useState<string | undefined>(undefined)

    function createNewTask(title: string, hour: number, tag: string) {
        const userIdStr = localStorage["userId"]
        const userId = Number(userIdStr)
        
        const date = addNewTaskInfo.date
        date.setHours(hour)
        
        service.createNewTask(userId, {
            title: title,
            date: date,
            tag: tag
        })
        .then(() => onNewTaskCreated()  )
        .catch((error) => setError(error));
    }

    return { title, hour, tag, setTitle, setHour, setTag, createNewTask }
}

function HourPicker({hour, onHourChange} : {hour: number | undefined, onHourChange: (hour: number) => void}) {
    return (
        <div>
            <label>Hour</label>
            <br/>
            <input type="number" min={0} max={23} value={hour} onChange={(e) => onHourChange(Number(e.target.value))} />
        </div>
    )
}

function CategoryAndTagPicker({onTagClick} : {onTagClick: (tag: string) => void}) {
    const [category, setCategory] = useState<Category | undefined>(undefined)

    return (
        category == undefined ? 
            <CategoryPicker onCategoryClick={setCategory} />
        :
        <TagPicker category={category} onTagClick={onTagClick} />
    )
    
}

function CategoryPicker({onCategoryClick} : {onCategoryClick: (cat: Category) => void}) {
    return (
        categories.map((cat: Category, index: number) => 
            <div key={index}>
                <button onClick={() => onCategoryClick(cat)}>
                    {cat.name}
                </button>
                <label>{cat.name}</label>
            </div>
        )
    )
}

function TagPicker({category, onTagClick} : {category: Category, onTagClick: (tag: string) => void}) {
    return (
        category.tags.map((tag: string, index: number) => 
            <div key={index}>
                <button onClick={() => onTagClick(tag)}>
                    {tag}
                </button>
            </div>
        )
    )
}