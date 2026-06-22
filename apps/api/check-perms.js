const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const perms = await prisma.permission.findMany({
    where: { name: { startsWith: 'settings' } }
  });
  console.log(JSON.stringify(perms, null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
