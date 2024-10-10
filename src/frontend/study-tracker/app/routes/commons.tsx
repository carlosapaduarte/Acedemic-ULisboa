import { useState } from "react";
import styles from "~/routes/tasks/tasksPage.module.css";

export function useTags() {
    const [tags, setTags] = useState<string[]>([]);

    function removeTag(tag: string) {
        if (tags == undefined)
            return;
        const new_tags = tags.filter((t: string) => t != tag);
        setTags(new_tags);
    }

    function appendTag(tag: string) {
        let new_tags;
        if (tags == undefined)
            new_tags = [tag];
        else {
            if (tags.includes(tag))
                return;
            new_tags = [...tags];
            new_tags.push(tag);
        }
        setTags(new_tags);
    }

    return { tags, appendTag, removeTag };
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
];

export function CategoryAndTagsPicker({ tags, removeTag, appendTag }: {
    tags: string[],
    removeTag: (tag: string) => void,
    appendTag: (tag: string) => void
}) {
    const [category, setCategory] = useState<Category | undefined>(undefined);

    function onTagClickHandler(tag: string) {
        if (tags.includes(tag))
            removeTag(tag);
        else
            appendTag(tag);
    }

    return (
        <div>
            <h1 className={styles.createTaskTitle}>Tags</h1>
            <h4>Current Tags</h4>
            <div className={styles.currentTags}>
                {
                    tags.length == 0 ?
                        <div>No tags selected yet.</div>
                        :
                        tags.map((tag: string, index: number) =>
                            <div key={index} className={styles.currentTag}>
                                {tag}
                            </div>
                        )}
            </div>
            <h4>Select Tags:</h4>
            {category == undefined ?
                <CategoryPicker onCategoryClick={setCategory} />
                :
                <TagPicker tags={tags} category={category} onCategoryCloseClick={() => {
                    setCategory(undefined);
                }} onTagClick={onTagClickHandler} />
            }
        </div>

    );
}

function CategoryPicker({ onCategoryClick }: { onCategoryClick: (cat: Category) => void }) {
    return (
        categories.map((cat: Category, index: number) =>
            <div key={index}>
                <button onClick={() => onCategoryClick(cat)} className={styles.openCategoryButton}>
                    {cat.name}
                </button>
            </div>
        )
    );
}

function TagPicker(
    { category, tags, onCategoryCloseClick, onTagClick }:
        { category: Category, tags: string[], onCategoryCloseClick: () => void, onTagClick: (tag: string) => void }
) {
    return (
        <div>
            <button onClick={() => onCategoryCloseClick()} className={styles.openCategoryButton}>
                {category.name} (Close)
            </button>
            {
                category.tags.map((tag: string, index: number) =>
                    <div key={index}>
                        <input type={"checkbox"} id={`tag_${index}`} onClick={() => onTagClick(tag)}
                               checked={tags.includes(tag)} />
                        <label className={styles.tagLabel} htmlFor={`tag_${index}`}>
                            {tag}
                        </label>
                    </div>
                )
            }
        </div>

    );
}

export const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

export function useWeekDayAndHourPicker() {
    const [weekDay, setWeekDayInternal] = useState<number | undefined>(undefined);
    const [hour, setHourInternal] = useState<number | undefined>(undefined);

    function setWeekDay(newWeekDay: number) {
        if (newWeekDay == weekDay) {
            setWeekDayInternal(undefined);
            return;
        }

        if (newWeekDay >= 0 && newWeekDay <= 6)
            setWeekDayInternal(newWeekDay);
    }

    function setHour(hour: number) {
        if (hour >= 0 && hour <= 23)
            setHourInternal(hour);
    }

    return { weekDay, hour, setWeekDay, setHour };
}

function ConfirmButton({ weekDay, hour, onConfirm }:
                           {
                               weekDay: number,
                               hour: number,
                               onConfirm: (weekDayAndHour: WeekDayAndHour) => void
                           }) {
    return (
        <div>
            <br />
            <button onClick={() => onConfirm({ weekDay, hour })}>
                Confirm Here!
            </button>
        </div>
    );
}

export type WeekDayAndHour = {
    weekDay: number,
    hour: number
}

export function WeekDayAndHourPicker({ onConfirm }: { onConfirm: (weekDayAndHour: WeekDayAndHour) => void }) {
    const { weekDay, hour, setWeekDay, setHour } = useWeekDayAndHourPicker();

    return (
        <div>
            {weekDays.map((key: string, index: number) =>
                <div key={index}>
                    <button onClick={() => setWeekDay(index)}>
                        {key}
                    </button>
                </div>
            )}

            <br />

            <label>Hour</label>
            <input type="number" min={0} max={23} onChange={(e) => setHour(Number(e.target.value))} />


            {(weekDay && hour) ?
                <ConfirmButton weekDay={weekDay} hour={hour} onConfirm={onConfirm} />
                :
                <></>
            }

        </div>
    );
}