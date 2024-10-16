import { useWeekDayHourPicker, WeekDayAndHour, weekDays } from "~/hooks/useWeekDayHourPicker/useWeekDayHourPicker";

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

export function WeekDayHourPicker({ onConfirm }: { onConfirm: (weekDayAndHour: WeekDayAndHour) => void }) {
    const { weekDay, hour, setWeekDay, setHour } = useWeekDayHourPicker();

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