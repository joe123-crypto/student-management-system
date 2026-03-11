
import pkg from 'pg';

const { Client } = pkg;

async function testPg() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to run test-pg.ts');
  }

  console.log('Testing connection with pg driver...');
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 30000,
  });

  const start = Date.now();
  try {
    await client.connect();
    console.log('Successfully connected with pg!');
    const res = await client.query('SELECT count(*) FROM "AuthUser"');
    console.log('Count:', res.rows[0].count);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : 'UnknownError';
    const code =
      typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code?: unknown }).code)
        : undefined;
    console.error('--- PG ERROR ---');
    console.error(name);
    console.error(message);
    if (code) console.log('Code:', code);
    console.error('----------------');
  } finally {
    const end = Date.now();
    console.log(`Finished in ${end - start}ms`);
    await client.end();
  }
}

testPg();
