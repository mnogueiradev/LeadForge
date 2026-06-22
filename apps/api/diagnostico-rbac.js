const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

const prisma = new PrismaClient();
const redis = new Redis();

async function run() {
  console.log("--- INICIANDO DIAGNÓSTICO DO FLUXO DE AUTORIZAÇÃO ---");

  // 1. Pegar o primeiro usuário do banco (simulando o logado)
  const user = await prisma.user.findFirst({
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    console.log("Nenhum usuário encontrado no banco.");
    return;
  }

  console.log(`\n1. Usuário Autenticado:`);
  console.log(`- userId: ${user.id}`);
  console.log(`- tenantId: ${user.tenantId}`);
  console.log(`- role: ${user.userRoles[0]?.role?.name}`);

  // 2. Extrair permissões efetivas do banco (da tabela role_permissions)
  const rolePermissions = user.userRoles[0]?.role?.permissions.map(rp => rp.permission.name) || [];
  console.log(`\n2. Permissões que este usuário possui efetivamente no BANCO DE DADOS (role_permissions):`);
  console.log(rolePermissions);

  // 3. Verificar Redis Cache
  const redisKey = `permissions:${user.tenantId}:${user.id}`;
  const cachedPermissionsStr = await redis.get(redisKey);
  let cachedPermissions = [];
  if (cachedPermissionsStr) {
    cachedPermissions = JSON.parse(cachedPermissionsStr);
  }
  console.log(`\n3. Permissões atualmente cacheadas no REDIS:`);
  console.log(cachedPermissionsStr ? cachedPermissions : "Nenhum cache encontrado");

  // 4. Verificar se as permissões de Settings existem na tabela global
  const allSettingsPerms = await prisma.permission.findMany({
    where: { name: { startsWith: 'settings.' } }
  });
  console.log(`\n4. As permissões globais de settings.* existem na tabela 'permissions'?`);
  console.log(allSettingsPerms.map(p => p.name));

  console.log("\n--- CONCLUSÃO ---");
  const hasReadInDb = rolePermissions.includes('settings.read');
  const hasReadInCache = cachedPermissions.includes('settings.read');
  
  if (!hasReadInDb) {
    console.log("=> CAUSA RAIZ: A permissão 'settings.read' existe na tabela global, mas NÃO ESTÁ VINCULADA à role do usuário na tabela 'role_permissions'.");
    console.log("=> O PermissionsGuard lê as permissões do usuário e não encontra 'settings.read', por isso retorna 403 Forbidden.");
  }
}

run().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  redis.quit();
});
