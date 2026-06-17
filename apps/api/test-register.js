require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
  try {
    const email = `test-${Date.now()}@example.com`;
    const password = 'Password123!';
    const name = 'Test User';
    const organizationName = 'Test Org';

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Running transaction...');
    const result = await prisma.$transaction(async (tx) => {
      console.log('Creating tenant...');
      const safeOrgName = organizationName || 'My Organization';
      const slug = safeOrgName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + uuidv4().split('-')[0];
      const tenant = await tx.tenant.create({
        data: {
          name: safeOrgName,
          slug,
        },
      });
      console.log('Tenant created:', tenant.id);

      console.log('Creating user...');
      const nameParts = name ? name.split(' ') : ['User'];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash: hashedPassword,
          tenantId: tenant.id,
          isActive: true,
        },
      });
      console.log('User created:', user.id);

      return { tenant, user };
    });

    console.log('Success:', result);
  } catch (error) {
    console.error('Registration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
