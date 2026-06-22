const Redis = require('ioredis');
const redis = new Redis();

async function run() {
  const keys = await redis.keys('rbac:*');
  if (keys.length > 0) {
    await redis.del(keys);
    console.log(`Apagadas ${keys.length} chaves de RBAC do Redis.`);
  } else {
    console.log("Nenhuma chave rbac:* encontrada.");
  }
}

run().catch(console.error).finally(() => redis.quit());
