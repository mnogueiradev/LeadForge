const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

const prisma = new PrismaClient();
const redis = new Redis();

async function run() {
  console.log("Iniciando correção de permissões...");

  // 1. Buscar as permissões do módulo de settings
  const settingsPermissions = await prisma.permission.findMany({
    where: {
      name: {
        startsWith: 'settings.'
      }
    }
  });

  if (settingsPermissions.length === 0) {
    console.log("As permissões de settings.* não foram encontradas no banco.");
    return;
  }

  console.log(`Encontradas ${settingsPermissions.length} permissões de settings.`);

  // 2. Buscar todas as roles de sistema (ex: Admin, Owner)
  // Assumindo que queremos dar essas permissões para todos os Admins/Owners
  const systemRoles = await prisma.role.findMany({
    where: {
      isSystem: true,
      name: {
        in: ['Admin', 'Owner'] // Assegurar que estamos pegando as roles corretas
      }
    }
  });

  console.log(`Encontradas ${systemRoles.length} roles de sistema (Admin/Owner).`);

  // 3. Associar as permissões a essas roles
  let addedCount = 0;
  for (const role of systemRoles) {
    for (const permission of settingsPermissions) {
      // Usar upsert ou verificar se existe para evitar erro de duplicidade
      const exists = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        }
      });

      if (!exists) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id
          }
        });
        addedCount++;
      }
    }
  }

  console.log(`Foram criadas ${addedCount} novas associações na tabela role_permissions.`);

  // 4. Limpar o cache de permissões do Redis para forçar a releitura
  // Uma forma simples é usar flushall se for dev, mas é melhor apagar apenas as chaves de permissões.
  const keys = await redis.keys('permissions:*');
  if (keys.length > 0) {
    await redis.del(keys);
    console.log(`Apagadas ${keys.length} chaves de cache do Redis.`);
  } else {
    console.log("Nenhum cache de permissão encontrado no Redis para limpar.");
  }

  console.log("Correção concluída com sucesso!");
}

run().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  redis.quit();
});
