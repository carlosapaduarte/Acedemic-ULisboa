
function sameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() == date2.getFullYear() && date1.getMonth() == date2.getMonth() && date1.getDate() == date2.getDate()
}

function getUserId(): number {
    const userIdStr = localStorage["userId"]
    return Number(userIdStr)
}

export const utils = {
    sameDay,
    getUserId
}