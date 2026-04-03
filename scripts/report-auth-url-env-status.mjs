import fs from 'node:fs';
import path from 'node:path';

const trackedKeys = ['NEXTAUTH_URL', 'NEXTAUTH_URL_INTERNAL', 'AUTH_URL', 'AUTH_URL_INTERNAL', 'VERCEL_URL'];

function getStatus(value) {
  if (typeof value !== 'string') {
    return 'unset';
  }

  return value.trim().length === 0 ? 'empty' : 'set';
}

function parseEnvFile(filePath) {
  const values = new Map();

  if (!fs.existsSync(filePath)) {
    return { exists: false, values };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const normalized = trimmed.startsWith('export ') ? trimmed.slice('export '.length).trimStart() : trimmed;
    const separatorIndex = normalized.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = normalized.slice(0, separatorIndex).trim();
    let value = normalized.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values.set(key, value);
  }

  return { exists: true, values };
}

function logScope(label, resolver) {
  console.log(`[auth-url-debug] ${label}`);
  for (const key of trackedKeys) {
    console.log(`- ${key}: ${resolver(key)}`);
  }
}

logScope('process.env', (key) => getStatus(process.env[key]));

for (const inputPath of process.argv.slice(2)) {
  const resolvedPath = path.resolve(process.cwd(), inputPath);
  const { exists, values } = parseEnvFile(resolvedPath);
  const displayPath = path.relative(process.cwd(), resolvedPath) || path.basename(resolvedPath);

  if (!exists) {
    console.log(`[auth-url-debug] ${displayPath}`);
    console.log('- file: missing');
    continue;
  }

  logScope(displayPath, (key) => (values.has(key) ? getStatus(values.get(key)) : 'unset'));
}
