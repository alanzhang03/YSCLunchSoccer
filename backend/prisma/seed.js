import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const sessions = [];
  const now = new Date();
  let currentDate = new Date(now);

  while (sessions.length < 8) {
    const dayOfWeek = currentDate.getDay();

    if (dayOfWeek === 1 || dayOfWeek === 5) {
      sessions.push({
        date: new Date(currentDate),
        dayOfWeek: dayOfWeek === 1 ? "Monday" : "Friday",
        startTime: "11:45 AM",
        endTime: "1:05 PM",
        timezone: "EST",
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  for (const sessionData of sessions) {
    await prisma.session.create({ data: sessionData });
  }

  console.log(`✅ Created ${sessions.length} sessions!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
