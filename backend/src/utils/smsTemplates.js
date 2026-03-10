export function gamedayMessage(session) {
    return `YSC Lunch Soccer reminder! You're confirmed for ${session.dayOfWeek} ${session.startTime}–${session.endTime} ${session.timezone}. See you there!`;
}
