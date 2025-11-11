import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.pageLayout.deleteMany(),
    prisma.journalEntry.deleteMany(),
    prisma.reminder.deleteMany(),
    prisma.obligation.deleteMany(),
    prisma.asset.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  console.log("Seed finished: database cleared, no sample data inserted.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
