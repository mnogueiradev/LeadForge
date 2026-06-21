const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Seeding permissions...');
  const permissions = [
    'organizations.read',
    'organizations.create',
    'organizations.update',
    'organizations.delete',
    'organizations.assign_owner',
    'contacts.read',
    'contacts.create',
    'contacts.update',
    'contacts.delete',
    'contacts.assign_owner',
    'leads.read',
    'leads.create',
    'leads.update',
    'leads.delete',
    'leads.assign_owner'
  ];

  for (const p of permissions) {
    await prisma.permission.upsert({
      where: { name: p },
      update: {},
      create: { name: p, description: `Permission for ${p}` }
    });
  }

  const allPerms = await prisma.permission.findMany({
    where: { name: { in: permissions } }
  });

  const tenants = await prisma.tenant.findMany();
  for (const tenant of tenants) {
    let adminRole = await prisma.role.findFirst({
      where: { tenantId: tenant.id, name: 'Admin' }
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          tenantId: tenant.id,
          name: 'Admin',
          isSystem: true
        }
      });
    }

    for (const p of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: p.id
          }
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: p.id
        }
      });
    }

    const users = await prisma.user.findMany({ where: { tenantId: tenant.id } });
    for (const user of users) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: adminRole.id
          }
        },
        update: {},
        create: {
          userId: user.id,
          roleId: adminRole.id
        }
      });
    }
  }

  console.log('Done!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
