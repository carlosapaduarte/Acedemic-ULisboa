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

function getWeekNumber(date: Date): number {
    // Copying date so the original date won't be modified
    const tempDate = new Date(date.valueOf());

    // ISO week date weeks start on Monday, so correct the day number
    const dayNum = (date.getDay() + 6) % 7;

    // Set the target to the nearest Thursday (current date + 4 - current day number)
    tempDate.setDate(tempDate.getDate() - dayNum + 3);

    // ISO 8601 week number of the year for this date
    const firstThursday = tempDate.valueOf();

    // Set the target to the first day of the year
    // First set the target to January 1st
    tempDate.setMonth(0, 1);

    // If this is not a Thursday, set the target to the next Thursday
    if (tempDate.getDay() !== 4) {
        tempDate.setMonth(0, 1 + ((4 - tempDate.getDay()) + 7) % 7);
    }

    // The weeknumber is the number of weeks between the first Thursday of the year
    // and the Thursday in the target week
    return 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000); // 604800000 = number of milliseconds in a week
}

// d1 should be greater than d2
function elapsedMinutes(d1: Date, d2: Date): number {
    const diff = d1.getTime() - d2.getTime()
    return Math.trunc(diff / 1000 / 60) // Converts to minutes
}

export const utils = {
    sameDay,
    toInputDateValueStr,
    getWeekNumber,
    elapsedMinutes
};