import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // clear existing data for fresh seed
  await prisma.attendance.deleteMany({});
  await prisma.session.deleteMany({});
  console.log('🗑️  Cleared existing sessions and attendances');

  const sessions = [];
  const now = new Date();
  let currentDate = new Date(now);

  while (sessions.length < 8) {
    const dayOfWeek = currentDate.getDay();

    if (dayOfWeek === 1 || dayOfWeek === 5) {
      const existing = await prisma.session.findFirst({
        where: {
          date: {
            gte: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate(),
            ),
            lt: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              currentDate.getDate() + 1,
            ),
          },
        },
      });

      if (!existing) {
        sessions.push({
          date: new Date(currentDate),
          dayOfWeek: dayOfWeek === 1 ? 'Monday' : 'Friday',
          startTime: '11:20 AM',
          endTime: '1:05 PM',
          timezone: 'EST',
        });
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  for (const sessionData of sessions) {
    await prisma.session.create({ data: sessionData });
  }

  console.log(`✅ Created ${sessions.length} sessions for Monday and Friday!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
