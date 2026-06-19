const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Testing Prisma...");
  try {
    const user = await prisma.user.findFirst();
    console.log('Success:', user ? 'User found' : 'No users');
  } catch(e) {
    console.error('Prisma Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
