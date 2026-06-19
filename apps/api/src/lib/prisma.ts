import { PrismaClient } from '@prisma/client';
import { connect } from '@tidbcloud/serverless';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';

let prisma: PrismaClient;

if (!(globalThis as any).prisma) {
  // Use a conexão HTTP Serverless em vez do driver nativo TCP para evitar timeouts na porta 4000
  const connectionString = process.env.DATABASE_URL || '';
  const connection = connect({ url: connectionString });
  const adapter = new PrismaTiDBCloud(connection);
  
  (globalThis as any).prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
}

prisma = (globalThis as any).prisma;

export { prisma };
