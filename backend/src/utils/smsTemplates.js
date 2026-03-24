export function gamedayMessage(session, { teamNum, teamColor, teammates }) {
    const teammateList = teammates.map(name => `- ${name}`).join('\n');
    return `YSC Lunch Soccer!\nYou're on Team ${teamNum} (${teamColor}):\n${teammateList}\n\nSee you ${session.dayOfWeek} ${session.startTime}!`;
}

export function deleteSessionMessage(session) {
    return `YSC Lunch Soccer, the session on ${session.date} (${session.dayOfWeek}) from ${session.startTime} to ${session.endTime} has been deleted, sorry :(.)`
}
