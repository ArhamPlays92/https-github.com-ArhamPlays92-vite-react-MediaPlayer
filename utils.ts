
import { Blob } from '@google/genai';

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// Generate a stable numeric ID from file properties
export const generateStableId = (file: File): number => {
    const str = `${file.name}-${file.size}-${file.lastModified}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

export const isAudio = (file: File) => file.type.startsWith('audio/');
export const isVideo = (file: File) => file.type.startsWith('video/');
export const isMedia = (file: File) => isAudio(file) || isVideo(file);

// IndexedDB helpers
function openDB(name: string, version: number, upgradeCallback: (db: IDBDatabase) => void): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);
        request.onupgradeneeded = () => upgradeCallback(request.result);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getDB() {
    return openDB('media-player-db', 1, db => {
        if (!db.objectStoreNames.contains('keyval')) {
            db.createObjectStore('keyval');
        }
    });
}

export const idb = {
    async get<T>(key: IDBValidKey): Promise<T | undefined> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('keyval', 'readonly');
            const store = transaction.objectStore('keyval');
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result as T);
            request.onerror = () => reject(request.error);
        });
    },
    async set(key: IDBValidKey, value: any): Promise<void> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('keyval', 'readwrite');
            const store = transaction.objectStore('keyval');
            const request = store.put(value, key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },
    async delete(key: IDBValidKey): Promise<void> {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction('keyval', 'readwrite');
            const store = transaction.objectStore('keyval');
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
};
