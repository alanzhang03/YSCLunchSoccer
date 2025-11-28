import prisma from "../db/client.js";

export async function sessionGenerator() {
  try {
    const today = new Date();
    const formattedDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const deleteSessions = await prisma.session.deleteMany({
      where: {
        date: {
          lt: formattedDate,
        },
      },
    });

    const currSessions = await prisma.session.findMany({
      where: {
        date: {
          gte: formattedDate,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    let startDate = formattedDate;
    if (currSessions.length > 0) {
      const latestSession = currSessions[currSessions.length - 1];
      startDate = new Date(latestSession.date);
      startDate.setDate(startDate.getDate() + 1);
    }

    let currentDate = new Date(startDate);
    let sessionsCreated = 0;

    while (currSessions.length + sessionsCreated < 8) {
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek === 1 || dayOfWeek === 5) {
        const dateToCheck = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate()
        );

        const existingSession = await prisma.session.findFirst({
          where: {
            date: {
              gte: dateToCheck,
              lt: new Date(dateToCheck.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        });
        if (!existingSession) {
          await prisma.session.create({
            data: {
              date: dateToCheck,
              dayOfWeek: dayOfWeek === 1 ? "Monday" : "Friday",
              startTime: "11:45 AM",
              endTime: "1:05 PM",
              timezone: "EST",
            },
          });
          sessionsCreated++;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(
      `✅ Session generation complete. Created ${sessionsCreated} new session(s). Total future sessions: ${
        currSessions.length + sessionsCreated
      }`
    );
  } catch (error) {
    console.log("Error with fetching", error);
  }
}
