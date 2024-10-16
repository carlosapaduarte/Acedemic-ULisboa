import { ChangeEvent, useState } from "react";
import { useSetGlobalError } from "~/components/error/GlobalErrorContainer";
import { service } from "~/service/service";
import { utils } from "~/utils";
import { useTags } from "~/hooks/useTags";
import { CategoryAndTagsPicker } from "~/components/CategoryAndTagsPicker/CategoryAndTagsPicker";

export function AddEvent({ startDate, onNewEventCreated }: { startDate: Date, onNewEventCreated: () => void }) {
    const {
        title,
        endDate,
        tags,
        setTitle,
        setEndDate,
        appendTag,
        removeTag,
        createNewEvent
    } = useAddEvent(startDate, onNewEventCreated);

    let confirmButtonDom = <></>;
    if (title.length > 0 && endDate != undefined && tags != undefined)
        confirmButtonDom =
            <button onClick={() => createNewEvent(title, endDate, tags)}>
                Confirm!
            </button>;

    return (
        <div>
            <label>Title</label>
            <br />
            <input value={title} placeholder="New event..." onChange={e => setTitle(e.target.value)} />
            <EndDatePicker selectedDate={endDate ? endDate : new Date()} onEndDateChange={setEndDate} />
            <CategoryAndTagsPicker tags={[]} appendTag={appendTag} removeTag={removeTag} />
            {confirmButtonDom}
        </div>
    );
}

function useAddEvent(startDate: Date, onNewEventCreated: () => void) {
    const setError = useSetGlobalError();

    const [title, setTitle] = useState<string>("");
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const { tags, appendTag, removeTag } = useTags();

    function createNewEvent(title: string, endDate: Date, tags: string[]) {
        service.createNewEvent({
            title,
            startDate,
            endDate,
            tags,
            everyWeek: false
        })
            .then(() => onNewEventCreated())
            .catch((error) => setError(error));
    }

    return { title, endDate, tags, setTitle, setEndDate, appendTag, removeTag, createNewEvent };
}

function EndDatePicker({ selectedDate, onEndDateChange }: {
    selectedDate: Date,
    onEndDateChange: (date: Date) => void
}) {

    function onEndDateChangeHandler(e: ChangeEvent<HTMLInputElement>) {
        const selectedEndDate = new Date(e.target.value);
        onEndDateChange(selectedEndDate);
    }

    const todayStr = utils.toInputDateValueStr(selectedDate);
    return (
        <div>
            <label>End date</label>
            <br />
            <input
                type="datetime-local"
                value={todayStr}
                min={todayStr}
                onChange={onEndDateChangeHandler}
            />
        </div>
    );
}