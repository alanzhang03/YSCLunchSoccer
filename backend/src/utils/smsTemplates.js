export function gamedayMessage(session, { teamColor, teammates }) {
    return `YSC Lunch Soccer! You're on ${teamColor} with ${teammates.join(', ')}. See you ${session.dayOfWeek} ${session.startTime}!`
}

export function deleteSessionMessage(session) {
    return `YSC Lunch Soccer, the session on ${session.date} (${session.dayOfWeek}) from ${session.startTime} to ${session.endTime} has been deleted, sorry :(.)`
}
