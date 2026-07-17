export function gamedayMessage(
  session,
  { teamNum, teamColor, teammates, opponentTeam, fieldName },
) {
  const teammateList = teammates.map((name) => `- ${name}`).join('\n');
  const fieldText = fieldName ? ` on ${fieldName}` : '';
  return `YSC Lunch Soccer\n\nYou're on Team ${teamNum} (${teamColor}) playing against ${opponentTeam}${fieldText}:\n\nTeam:\n${teammateList}\n\nSee you today at ${session.startTime} on the ${session.fieldLocation}! Make sure to bring a Dark and White shirt.`;
}

export function helpMessage() {
  return (
    'YSC Lunch Soccer SMS Help:\n' +
    'STOP - Unsubscribe from all SMS notifications\n' +
    'START - Re-subscribe to SMS notifications\n' +
    'HELP - Show this message'
  );
}

export function deleteSessionMessage(session) {
  const d = new Date(session.date);
  const formattedDate = `${session.dayOfWeek}, ${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return `YSC Lunch Soccer\n\nThe session on ${formattedDate} from ${session.startTime} to ${session.endTime} has been canceled, sorry.`;
}
