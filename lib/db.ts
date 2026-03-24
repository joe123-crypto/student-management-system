import { PrismaClient } from '@prisma/client';

function parseTransactionOption(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    transactionOptions: {
      maxWait: parseTransactionOption(process.env.PRISMA_TRANSACTION_MAX_WAIT_MS, 10_000),
      // Student profile updates can span many dependent queries plus file-link writes.
      timeout: parseTransactionOption(process.env.PRISMA_TRANSACTION_TIMEOUT_MS, 30_000),
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
