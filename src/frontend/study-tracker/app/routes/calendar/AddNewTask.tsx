import { ChangeEvent, useEffect, useState } from "react"
import { useSetError } from "~/components/error/ErrorContainer"
import { NewTaskInfo, service } from "~/service/service"
import { utils } from "~/utils"

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
	const { title, endDate, tags, setTitle, setEndDate, appendTag, createNewTask } = useAddTask(startDate, onNewTaskCreated)

    let confirmButtonDom = <></>
    if (title.length > 0  && endDate != undefined && tags != undefined)
        confirmButtonDom = 
            <button onClick={() => createNewTask(title, endDate, tags)}>
                Confirm!
            </button>

	return (
		<div>
			<label>Title</label>
			<br/>
			<input value={title} placeholder="New task..." onChange={e => setTitle(e.target.value)} />
			<EndDatePicker selectedDate={endDate ? endDate : new Date()} onEndDateChange={setEndDate} />
            <CategoryAndTagsPicker onTagClick={appendTag}/>
            {confirmButtonDom}
		</div>
	)
}

function useAddTask(startDate: Date, onNewTaskCreated: () => void) {
    const setError = useSetError();    
    
    const [title, setTitle] = useState<string>("")
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [tags, setTags] = useState<string[] | undefined>(undefined)

    function appendTag(tag: string) {
        let new_tags
        if (tags == undefined)
            new_tags = [tag]
        else {
            if (tags.includes(tag))
                return
            new_tags = [...tags]
            new_tags.push(tag)
        }
        setTags(new_tags)
    }

    function createNewTask(title: string, endDate: Date, tags: string[]) {
        let userId = utils.getUserId()
                
        service.createNewTask(userId, {
            title,
            startDate,
            endDate,
            tags
        })
        .then(() => onNewTaskCreated()  )
        .catch((error) => setError(error));
    }

    return { title, endDate, tags, setTitle, setEndDate, appendTag, createNewTask }
}

function EndDatePicker({selectedDate, onEndDateChange} : {selectedDate: Date, onEndDateChange: (date: Date) => void}) {
    
    function onEndDateChangeHandler(e: ChangeEvent<HTMLInputElement>) {
        const selectedEndDate = new Date(e.target.value)
        onEndDateChange(selectedEndDate)
    }

    function toInputDateValueStr(date: Date) {

        // +1 is needed because, then, <input> component will display the previous month
        const month = date.getMonth() + 1
        const monthStr = month < 10 ? `0${month}` : month.toString()

        // For some reason, it's not necessary to add +1 here
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
            <label>End date</label>
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

function CategoryAndTagsPicker({onTagClick} : {onTagClick: (tag: string) => void}) {
    const [category, setCategory] = useState<Category | undefined>(undefined)

    function onTagClickHandler(tag: string) {
        setCategory(undefined) // Allows to select new tag
        onTagClick(tag)
    }

    return (
        category == undefined ? 
            <CategoryPicker onCategoryClick={setCategory} />
        :
        <TagPicker category={category} onTagClick={onTagClickHandler} />
    )
}

function CategoryPicker({onCategoryClick} : {onCategoryClick: (cat: Category) => void}) {
    return (
        categories.map((cat: Category, index: number) => 
            <div key={index}>
                <button onClick={() => onCategoryClick(cat)}>
                    {cat.name}
                </button>
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