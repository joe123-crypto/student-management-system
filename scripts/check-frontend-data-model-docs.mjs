import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docPath = path.join(root, 'docs/architecture/frontend-data-model.md');

const typeSources = [
  path.join(root, 'types.ts'),
  path.join(root, 'services/contracts.ts'),
  path.join(root, 'components/features/attache/types.ts'),
];

const keySources = [
  path.join(root, 'mock/prototypeDatabase.ts'),
  path.join(root, 'services/mock/announcementsService.ts'),
  path.join(root, 'services/mock/permissionsService.ts'),
  path.join(root, 'services/mock/authService.ts'),
];

const REQUIRED_STORAGE_CONSTANTS = [
  'PROTOTYPE_DATABASE_STORAGE_KEY',
  'ANNOUNCEMENTS_STORAGE_KEY',
  'PERMISSION_REQUESTS_STORAGE_KEY',
  'USER_STORAGE_KEY',
  'AUTH_PASSWORDS_STORAGE_KEY',
];

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function extractExportedTypeNames(content) {
  const names = new Set();
  const regex = /export\s+(?:interface|type|enum)\s+([A-Za-z0-9_]+)/g;
  let match = regex.exec(content);
  while (match) {
    names.add(match[1]);
    match = regex.exec(content);
  }
  return names;
}

function extractStorageConstants(content) {
  const values = new Map();
  const regex = /const\s+([A-Z0-9_]+)\s*=\s*'([^']+)'/g;
  let match = regex.exec(content);
  while (match) {
    values.set(match[1], match[2]);
    match = regex.exec(content);
  }
  return values;
}

const doc = read(docPath);

const requiredTypeNames = new Set();
for (const sourcePath of typeSources) {
  const names = extractExportedTypeNames(read(sourcePath));
  for (const name of names) requiredTypeNames.add(name);
}

const missingTypeSections = [...requiredTypeNames].filter((name) => !doc.includes(`### \`${name}\``));

const foundStorageConstants = new Map();
for (const sourcePath of keySources) {
  const constants = extractStorageConstants(read(sourcePath));
  for (const [name, value] of constants.entries()) {
    if (REQUIRED_STORAGE_CONSTANTS.includes(name)) {
      foundStorageConstants.set(name, value);
    }
  }
}

const missingStorageConstants = [];
for (const constantName of REQUIRED_STORAGE_CONSTANTS) {
  const value = foundStorageConstants.get(constantName);
  if (!value) {
    missingStorageConstants.push(`${constantName} (not found in source files)`);
    continue;
  }
  if (!doc.includes(`| \`${constantName}\` | \`${value}\` |`)) {
    missingStorageConstants.push(`${constantName} -> ${value}`);
  }
}

if (missingTypeSections.length || missingStorageConstants.length) {
  console.error('Frontend data model docs drift detected.');
  if (missingTypeSections.length) {
    console.error('\nMissing type sections (expected heading format: ### `TypeName`):');
    for (const name of missingTypeSections.sort()) {
      console.error(`- ${name}`);
    }
  }
  if (missingStorageConstants.length) {
    console.error('\nMissing storage key rows in Local Storage Keys table:');
    for (const row of missingStorageConstants) {
      console.error(`- ${row}`);
    }
  }
  process.exit(1);
}

console.log('Frontend data model docs check passed.');
