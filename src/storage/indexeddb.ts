import { Editor } from 'grapesjs';
import { storageIDB, helpers } from '@/consts';

export default (editor: Editor, opts = {}) => {
    let db: IDBDatabase;
    const sm = editor.StorageManager;
    const storageName = storageIDB;
    // @ts-ignore
    const objsName = opts.objectStoreName;

    // Functions for DB retrieving
    const getDb = () => db;
    const getAsyncDb = () => new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
        } else {
            const indexedDB = window.indexedDB || 
                // @ts-ignore
                window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            // @ts-ignore
            const request = indexedDB.open(opts.dbName, opts.indexeddbVersion);
            request.onerror = reject;
            request.onsuccess = () => {
                db = request.result;
                db.onerror = reject;
                resolve(db);
            };
            request.onupgradeneeded = (_e: any) => {
                const objs = request.result.createObjectStore(objsName, { keyPath: 'id' });
                objs.createIndex('name', 'name', { unique: false });
            };
        }
    });

    // Functions for object store retrieving
    const getObjectStore = () => {
        return db.transaction([objsName], 'readwrite').objectStore(objsName);
    };
    const getAsyncObjectStore = async () => {
        if (db) {
            return getObjectStore();
        } else {
            await getAsyncDb();
            return getObjectStore();
        }
    };

    // Add custom storage to the editor
    sm.add(storageName, {
        ...helpers,
        getDb,

        getObjectStore,

        async load(_keys: any) {
            const objs = await getAsyncObjectStore();
            return new Promise(
                (resolve, reject) => {
                    const request = objs.get(this.currentId);
                    request.onerror = reject;
                    request.onsuccess = () => {
                        resolve(request.result || {});
                    };
                }
            );
        },

        async loadAll() {
            const objs = await getAsyncObjectStore();
            return new Promise(
                (resolve, reject) => {
                    const request = objs.getAll();
                    request.onerror = reject;
                    request.onsuccess = () => {
                        resolve(request.result || []);
                    };
                }
            );
        },

        async store(data: any) {
            const objs = await getAsyncObjectStore();
            return new Promise(
                (resolve, reject) => {
                    const request = objs.put({
                        id: this.currentId,
                        name: this.currentName,
                        template: this.isTemplate,
                        thumbnail: this.currentThumbnail,
                        description: this.description,
                        updated_at: Date.now(),
                        ...data
                    });
                    request.onerror = reject;
                    request.onsuccess = () => {
                        resolve(request.result);
                    };
                }
            );
        },

        async update(data: any) {
            const { id, ..._data } = data;
            const objs = await getAsyncObjectStore();
            return new Promise(
                (resolve, reject) => {
                    const request = objs.get(id);
                    request.onerror = reject;
                    request.onsuccess = () => {
                        objs.put({ id, ...request.result, ..._data });
                        resolve(request.result);
                    };
                }
            );
        },

        async delete(index: any) {
            const objs = await getAsyncObjectStore();
            return new Promise(
                (resolve, reject) => {
                    const request = objs.delete(index || this.currentId);
                    request.onerror = reject;
                    request.onsuccess = () => {
                        resolve(request.result);
                    };;
                }
            );
        }
    });
}