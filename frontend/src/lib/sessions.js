// get sessions for entire month
export function getUpcomingSessions(count = 8) {
  let sessions = [];
  const today = new Date();
  const copy = new Date(today);

  console.log(today);
  console.log(copy);

  //   const dayOfWeek = today.getDay();
  //   const day = today.getDate();
  //   const month = today.getMonth() + 1;
  //   const year = today.getFullYear();

  while (sessions.length < count) {
    const day_of_week = copy.getDay();
    if (day_of_week == 1 || day_of_week == 5) {
      sessions.push({
        id: sessions.length,
        date: formatDate(copy),
        weekday: copy.getDay(),
        time: "11:45 AM - 1:05 PM EST",
        available: "0/100",
      });
    }
    copy.setDate(copy.getDate() + 1);
  }

  return sessions;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

getUpcomingSessions();
