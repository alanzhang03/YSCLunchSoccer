// get sessions for entire month
export function getUpcomingSessions(count = 8) {
  let sessions = [];
  const today = new Date();
  const copy = new Date(today);

  const todayDateString = getDateString(today);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateString = getDateString(tomorrow);

  while (sessions.length < count) {
    const day_of_week = copy.getDay();
    if (day_of_week == 1 || day_of_week == 5) {
      const sessionDateString = getDateString(copy);
      const isToday = sessionDateString === todayDateString;
      const isTomorrow = sessionDateString === tomorrowDateString;

      sessions.push({
        id: Date.now() + sessions.length,
        date: formatDate(copy),
        weekday: day_of_week === 1 ? "Monday" : "Friday",
        time: "11:45 AM - 1:05 PM EST",
        available: "0/100",
        today: isToday,
        tomorrow: isTomorrow,
        dateObj: new Date(copy), // Keep date object for future use
      });
    }
    copy.setDate(copy.getDate() + 1);
  }

  return sessions;
}

function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
