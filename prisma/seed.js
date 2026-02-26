// Simple demo seed for Escapade
// Run with: npx prisma db seed

const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  const user = await db.user.upsert({
    where: { email: "demo@escapade.app" },
    update: {},
    create: {
      email: "demo@escapade.app",
      name: "Demo Explorer",
    },
  });

  const weekend = await db.weekend.create({
    data: {
      userId: user.id,
      title: "Sample Weekend",
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      budgetTarget: 200,
      totalSpent: 80,
      score: 72,
    },
  });

  const activity = await db.activity.create({
    data: {
      userId: user.id,
      title: "Sunset walk & coffee",
      category: "Relaxation",
      baseCost: 20,
    },
  });

  await db.plannedActivity.create({
    data: {
      weekendId: weekend.id,
      activityId: activity.id,
      date: new Date(),
      startTime: "18:00",
      durationMin: 90,
      cost: 20,
      completed: false,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

