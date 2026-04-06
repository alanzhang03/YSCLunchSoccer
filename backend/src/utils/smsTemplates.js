export function gamedayMessage(
  session,
  { teamNum, teamColor, teammates, opponentTeam, fieldNumber },
) {
  const teammateList = teammates.map((name) => `- ${name}`).join('\n');
  return `YSC Lunch Soccer\n\nYou're on Team ${teamNum} (${teamColor}) playing against ${opponentTeam} on field ${fieldNumber}:\n\nTeam:\n${teammateList}\n\nSee you today at ${session.startTime} on the ${session.fieldLocation}! Make sure to bring a Dark and White shirt.`;
}

export function deleteSessionMessage(session) {
  return `YSC Lunch Soccer, the session on ${session.date} (${session.dayOfWeek}) from ${session.startTime} to ${session.endTime} has been deleted, sorry :(.)`;
}
