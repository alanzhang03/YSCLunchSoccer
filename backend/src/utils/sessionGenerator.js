import prisma from '../db/client.js';

async function verifyDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

async function waitForDatabaseConnection(maxRetries = 5, delayMs = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    const isConnected = await verifyDatabaseConnection();
    if (isConnected) {
      return true;
    }
    if (i < maxRetries - 1) {
      console.log(
        `⏳ Waiting for database connection... (attempt ${i + 1}/${maxRetries})`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return false;
}

export async function sessionGenerator() {
  try {
    const isConnected = await waitForDatabaseConnection();
    if (!isConnected) {
      throw new Error(
        '❌ Cannot connect to database. Please check your database connection and try again.',
      );
    }

    const today = new Date();
    const formattedDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
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
        date: 'asc',
      },
    });

    let startDate = formattedDate;
    if (currSessions.length > 0) {
      const latestSession = currSessions[currSessions.length - 1];
      const latestDate = new Date(latestSession.date);
      startDate = new Date(
        latestDate.getFullYear(),
        latestDate.getMonth(),
        latestDate.getDate() + 1,
      );
    }

    let currentDate = new Date(startDate);
    let sessionsCreated = 0;

    while (currSessions.length + sessionsCreated < 6) {
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        const dateToCheck = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
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
              dayOfWeek:
                dayOfWeek === 1
                  ? 'Monday'
                  : dayOfWeek === 3
                    ? 'Wednesday'
                    : 'Friday',
              startTime: '11:20 AM',
              endTime: '1:05 PM',
              timezone: 'EST',
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
      }`,
    );
  } catch (error) {
    if (error.message?.includes('database')) {
      console.error('❌ Database connection error:', error.message);
    } else if (error.code === 'P1001') {
      console.error(
        '❌ Cannot reach database server. Please check:',
        '\n  1. Your database server is running',
        '\n  2. Your DATABASE_URL environment variable is correct',
        '\n  3. Your network connection is stable',
        '\n  4. Your database credentials are valid',
      );
    } else {
      console.error('❌ Error in session generation:', error.message || error);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
    throw error;
  }
}
