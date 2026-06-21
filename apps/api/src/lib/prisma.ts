import { PrismaClient } from '@prisma/client';
import { connect } from '@tidbcloud/serverless';
import { PrismaTiDBCloud } from '@tidbcloud/prisma-adapter';

let prisma: any;

if (!(globalThis as any).prisma) {
  // Use a conexão HTTP Serverless em vez do driver nativo TCP para evitar timeouts na porta 4000
  const connectionString = process.env.DATABASE_URL || '';
  const connection = connect({ url: connectionString });
  const adapter = new PrismaTiDBCloud(connection) as any;
  
  (globalThis as any).prisma = new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  }) as any;
}

prisma = (globalThis as any).prisma;

export { prisma };
