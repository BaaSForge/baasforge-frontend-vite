/**
 * Minimal IndexedDB key-value access (larger quota than localStorage).
 *
 * TODO: Evict entries not loaded for 30+ days (see callers / domain stores) so this DB does not grow without bound.
 */

const DB_NAME = "baal-client-kv";
const DB_VERSION = 1;
const STORE = "kv";

let dbPromise: Promise<IDBDatabase> | null = null;

function openClientIdb(): Promise<IDBDatabase> {
    if (dbPromise != null) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onerror = () => {
            reject(req.error ?? new Error("IndexedDB open failed"));
        };
        req.onsuccess = () => {
            resolve(req.result);
        };
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE)) {
                db.createObjectStore(STORE);
            }
        };
    });
    return dbPromise;
}

export async function clientIdbGet<T>(key: string): Promise<T | undefined> {
    const db = await openClientIdb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const store = tx.objectStore(STORE);
        const r = store.get(key);
        r.onerror = () => reject(r.error ?? new Error("IndexedDB get failed"));
        r.onsuccess = () => resolve(r.result as T | undefined);
    });
}

export async function clientIdbSet<T>(key: string, value: T): Promise<void> {
    const db = await openClientIdb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const store = tx.objectStore(STORE);
        const r = store.put(value, key);
        r.onerror = () => reject(r.error ?? new Error("IndexedDB put failed"));
        r.onsuccess = () => resolve();
    });
}

export async function clientIdbDelete(key: string): Promise<void> {
    const db = await openClientIdb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        const store = tx.objectStore(STORE);
        const r = store.delete(key);
        r.onerror = () => reject(r.error ?? new Error("IndexedDB delete failed"));
        r.onsuccess = () => resolve();
    });
}

export async function clientIdbListKeysByPrefix(prefix: string): Promise<string[]> {
    const db = await openClientIdb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const store = tx.objectStore(STORE);
        const range = IDBKeyRange.bound(prefix, `${prefix}\uffff`);
        const keys: string[] = [];
        const r = store.openKeyCursor(range);
        r.onerror = () => reject(r.error ?? new Error("IndexedDB key cursor failed"));
        r.onsuccess = () => {
            const cursor = r.result;
            if (cursor == null) {
                resolve(keys);
                return;
            }
            if (typeof cursor.key === "string") keys.push(cursor.key);
            cursor.continue();
        };
    });
}
