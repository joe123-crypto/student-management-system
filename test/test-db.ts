
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
    console.log('Testing database connection with verbose logging...');
    const start = Date.now();
    try {
        const count = await prisma.authUser.count();
        console.log(`Connection successful! AuthUser count: ${count}`);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const name = error instanceof Error ? error.name : 'UnknownError';
        const code =
            typeof error === 'object' && error !== null && 'code' in error
                ? String((error as { code?: unknown }).code)
                : undefined;
        console.log('--- CONNECTION ERROR ---');
        console.log(name);
        console.log(message);
        if (code) console.log(`Error Code: ${code}`);
        console.log('-------------------------');
    } finally {
        const end = Date.now();
        console.log(`Query took ${end - start}ms`);
        await prisma.$disconnect();
    }
}

testConnection();
