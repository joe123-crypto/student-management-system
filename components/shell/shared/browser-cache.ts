'use client';

const RUNTIME_CACHE_DB_NAME = 'student-platform-runtime-cache';
const RUNTIME_CACHE_STORE_NAME = 'entries';
const RUNTIME_CACHE_DB_VERSION = 1;
const RUNTIME_CACHE_RECORD_VERSION = 1;

type CacheRecord<T> = {
  key: string;
  version: number;
  expiresAt: number;
  value: T;
};

type CacheScope = {
  id: string;
  role: string;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function isIndexedDbAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openDatabase(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(new Error('IndexedDB is not available.'));
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(RUNTIME_CACHE_DB_NAME, RUNTIME_CACHE_DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(RUNTIME_CACHE_STORE_NAME)) {
        database.createObjectStore(RUNTIME_CACHE_STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      const database = request.result;

      database.onversionchange = () => {
        database.close();
        dbPromise = null;
      };

      resolve(database);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error ?? new Error('Failed to open IndexedDB.'));
    };

    request.onblocked = () => {
      dbPromise = null;
      reject(new Error('IndexedDB upgrade was blocked.'));
    };
  });

  return dbPromise;
}

async function getStore(mode: IDBTransactionMode): Promise<{
  store: IDBObjectStore;
  transaction: IDBTransaction;
}> {
  const database = await openDatabase();
  const transaction = database.transaction(RUNTIME_CACHE_STORE_NAME, mode);
  const store = transaction.objectStore(RUNTIME_CACHE_STORE_NAME);
  return { store, transaction };
}

export function getRuntimeCachePrefix(scope: CacheScope): string {
  return `runtime-cache:v1:${scope.role}:${scope.id}`;
}

export function getRuntimeCacheKey(scope: CacheScope, suffix: string): string {
  return `${getRuntimeCachePrefix(scope)}:${suffix}`;
}

export async function readCache<T>(key: string): Promise<T | null> {
  if (!isIndexedDbAvailable()) {
    return null;
  }

  const { store } = await getStore('readonly');

  return new Promise((resolve, reject) => {
    const request = store.get(key);

    request.onsuccess = () => {
      const record = request.result as CacheRecord<T> | undefined;
      if (!record) {
        resolve(null);
        return;
      }

      const isExpired = typeof record.expiresAt !== 'number' || record.expiresAt <= Date.now();
      const isVersionMismatch = record.version !== RUNTIME_CACHE_RECORD_VERSION;

      if (isExpired || isVersionMismatch) {
        void deleteCache(key);
        resolve(null);
        return;
      }

      resolve(record.value);
    };

    request.onerror = () => {
      reject(request.error ?? new Error(`Failed to read cache key "${key}".`));
    };
  });
}

export async function writeCache<T>(key: string, value: T, ttlMs: number): Promise<void> {
  if (!isIndexedDbAvailable()) {
    return;
  }

  if (ttlMs <= 0) {
    await deleteCache(key);
    return;
  }

  const { store, transaction } = await getStore('readwrite');

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error(`Failed to write cache key "${key}".`));
    transaction.onabort = () => reject(transaction.error ?? new Error(`Cache write aborted for key "${key}".`));

    store.put({
      key,
      version: RUNTIME_CACHE_RECORD_VERSION,
      expiresAt: Date.now() + ttlMs,
      value,
    } satisfies CacheRecord<T>);
  });
}

export async function deleteCache(key: string): Promise<void> {
  if (!isIndexedDbAvailable()) {
    return;
  }

  const { store, transaction } = await getStore('readwrite');

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error(`Failed to delete cache key "${key}".`));
    transaction.onabort = () => reject(transaction.error ?? new Error(`Cache delete aborted for key "${key}".`));

    store.delete(key);
  });
}

export async function clearCacheByPrefix(prefix: string): Promise<void> {
  if (!isIndexedDbAvailable()) {
    return;
  }

  const { store, transaction } = await getStore('readwrite');

  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error(`Failed to clear cache keys for prefix "${prefix}".`));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error(`Cache clear aborted for prefix "${prefix}".`));

    const request = store.openCursor();

    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        return;
      }

      const key = String(cursor.primaryKey);
      if (key.startsWith(prefix)) {
        cursor.delete();
      }

      cursor.continue();
    };

    request.onerror = () => {
      reject(request.error ?? new Error(`Failed to iterate cache keys for prefix "${prefix}".`));
    };
  });
}
