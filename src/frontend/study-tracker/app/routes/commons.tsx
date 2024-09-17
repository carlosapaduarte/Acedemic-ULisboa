import { useState } from "react"
import { useSetError } from "~/components/error/ErrorContainer"

export function useTags() {
    const [tags, setTags] = useState<string[]>([])

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

    return {tags, appendTag}
}

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

export function CategoryAndTagsPicker({onTagClick} : {onTagClick: (tag: string) => void}) {
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

export const weekDays = [ 
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
]

function useWeekDayAndHourPicker() {
    const [weekDay, setWeekDayInternal] = useState<number | undefined>(undefined)
    const [hour, setHourInternal] = useState<number | undefined>(undefined)

    function setWeekDay(weekDay: number) {
        if (weekDay >= 0 && weekDay <= 6)
            setWeekDayInternal(weekDay)
    }

    function setHour(hour: number) {
        if (hour >= 0 && hour <= 23)
            setHourInternal(hour)
    }

    return { weekDay, hour, setWeekDay, setHour }
}

function ConfirmButton({weekDay, hour, onConfirm} : 
    {
        weekDay: number, 
        hour: number, 
        onConfirm: (weekDayAndHour: WeekDayAndHour) => void
    }) {
    return (
        <div>
            <br/>
            <button onClick={() => onConfirm({weekDay, hour})}>
                Confirm Here!    
            </button>
        </div>
    )
}

export type WeekDayAndHour = {
    weekDay: number,
    hour: number
}

export function WeekDayAndHourPicker({onConfirm} : {onConfirm: (weekDayAndHour: WeekDayAndHour) => void}) {
    const { weekDay, hour, setWeekDay, setHour } = useWeekDayAndHourPicker()
 
    return (
        <div>
            {weekDays.map((key: string, index: number) => 
                <div key={index}>
                    <button onClick={() => setWeekDay(index)}>
                        {key}
                    </button>
                </div>
            )}

            <br/>

            <label>Hour</label>                
            <input type="number" min={0} max={23} onChange={(e) => setHour(Number(e.target.value))} />
            

            {(weekDay && hour) ? 
                <ConfirmButton weekDay={weekDay} hour={hour} onConfirm={onConfirm} />
                :
                <></>
            }
            
        </div>
    )
}