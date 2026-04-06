import prisma from '../db/client.js';

async function resetSessions() {
  try {
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`Deleted ${deletedSessions.count} sessions`);

    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    let currentDate = new Date(startDate);
    let sessionsCreated = 0;

    while (sessionsCreated < 6) {
      const dayOfWeek = currentDate.getDay();

      if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
        const dateToCheck = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        await prisma.session.create({
          data: {
            date: dateToCheck,
            dayOfWeek:
              dayOfWeek === 1
                ? 'Monday'
                : dayOfWeek === 3
                  ? 'Wednesday'
                  : 'Friday',
            startTime: '11:30 AM',
            endTime: '1:05 PM',
            timezone: 'EST',
          },
        });
        sessionsCreated++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`✅ Successfully created ${sessionsCreated} new sessions`);
  } catch (error) {
    console.error('❌ Error resetting sessions:', error.message || error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

resetSessions().catch(console.error);
