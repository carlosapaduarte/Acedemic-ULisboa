function sameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate();
}

// This function converts a Date type into a string that is recognizable by <input type="datetime-local" ../> component
export function toInputDateValueStr(date: Date) {

    // +1 is needed because, then, <input> component will display the previous month
    const month = date.getMonth() + 1;
    const monthStr = month < 10 ? `0${month}` : month.toString();

    // For some reason, it's not necessary to add +1 here
    const day = date.getDate();
    const dayStr = day < 10 ? `0${day}` : day.toString();
    const hour = date.getHours();
    const hourStr = hour < 10 ? `0${hour}` : hour.toString();
    const minute = date.getMinutes();
    const minuteStr = minute < 10 ? `0${minute}` : minute.toString();

    return `${date.getFullYear()}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}`;
}

export const utils = {
    sameDay,
    toInputDateValueStr
};