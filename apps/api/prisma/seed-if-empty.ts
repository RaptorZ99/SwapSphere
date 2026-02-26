import { prisma, seed } from "./seed.js";

const seedIfEmpty = async (): Promise<void> => {
  const existingUsers = await prisma.user.count();

  if (existingUsers > 0) {
    console.info(`SwapSphere seed skipped: database already contains ${existingUsers} user(s).`);
    return;
  }

  await seed();
};

seedIfEmpty()
  .catch((error: unknown) => {
    console.error("SwapSphere conditional seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
