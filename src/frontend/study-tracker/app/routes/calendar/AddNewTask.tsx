import { ChangeEvent, useEffect, useState } from "react"
import { useSetError } from "~/components/error/ErrorContainer"
import { NewTaskInfo, service } from "~/service/service"

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

export function AddTask({startDate, onNewTaskCreated} : {startDate: Date, onNewTaskCreated: () => void}) {
	const { title, endDate, tag, setTitle, setEndDate, setTag, createNewTask } = useAddTask(startDate, onNewTaskCreated)

    let confirmButtonDom = <></>
    if (title.length > 0  && endDate != undefined && tag != undefined)
        confirmButtonDom = 
            <button onClick={() => createNewTask(title, endDate, tag)}>
                Confirm!
            </button>

	return (
		<div>
			<label>Title</label>
			<br/>
			<input value={title} placeholder="New task..." onChange={e => setTitle(e.target.value)} />
			<EndDatePicker selectedDate={endDate ? endDate : new Date()} onEndDateChange={setEndDate} />
            <CategoryAndTagPicker onTagClick={setTag}/>
            {confirmButtonDom}
		</div>
	)
}

function useAddTask(startDate: Date, onNewTaskCreated: () => void) {
    const setError = useSetError();    
    
    const [title, setTitle] = useState<string>("")
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [tag, setTag] = useState<string | undefined>(undefined)

    function createNewTask(title: string, endDate: Date, tag: string) {
        const userIdStr = localStorage["userId"]
        const userId = Number(userIdStr)
                
        service.createNewTask(userId, {
            title,
            startDate,
            endDate,
            tag: tag
        })
        .then(() => onNewTaskCreated()  )
        .catch((error) => setError(error));
    }

    return { title, endDate, tag, setTitle, setEndDate, setTag, createNewTask }
}

function EndDatePicker({selectedDate, onEndDateChange} : {selectedDate: Date, onEndDateChange: (date: Date) => void}) {
    
    function onEndDateChangeHandler(e: ChangeEvent<HTMLInputElement>) {
        const selectedEndDate = new Date(e.target.value)
        onEndDateChange(selectedEndDate)
    }

    function toInputDateValueStr(date: Date) {
        const month = date.getMonth()
        const monthStr = month < 10 ? `0${month}` : month.toString()
        const day = date.getDate()
        const dayStr = day < 10 ? `0${day}` : day.toString()
        const hour = date.getHours()
        const hourStr = hour < 10 ? `0${hour}` : hour.toString()
        const minute = date.getMinutes()
        const minuteStr = minute < 10 ? `0${minute}` : minute.toString()
        
        return `${date.getFullYear()}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}`
    }

    const todayStr = toInputDateValueStr(selectedDate)
    return (
        <div>
            <label>Hour</label>
            <br/>
            <input
                type="datetime-local"
                value={todayStr}
                min={todayStr}
                onChange={onEndDateChangeHandler}
            />
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