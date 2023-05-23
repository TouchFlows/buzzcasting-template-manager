import { Editor } from 'grapesjs';
import { storageFireStore, helpers } from '@/consts';

export default (editor: Editor, opts = {}) => {
    const sm = editor.StorageManager;
    const storageName = storageFireStore;

    let db;
    let doc: any;
    let collection: any;
    // @ts-ignore
    const { apiKey, authDomain, projectId } = opts;
    // @ts-ignore
    const dbSettings = opts.settings;
    // @ts-ignore
    const onError = err => sm.onError(storageName, err.code || err);

    const getDoc = () => doc;

    const getAsyncCollection = () => {
        if (collection) return collection;
        // @ts-ignore
        if (!firebase.apps.length) {
            // @ts-ignore
            firebase.initializeApp({ apiKey, authDomain, projectId, ...opts.firebaseConfig });
            // @ts-ignore
            db = firebase.firestore();
            db.settings(dbSettings);
        }
        else {
            // @ts-ignore
            firebase.app();
            // @ts-ignore
            db = firebase.firestore();
            db.settings(dbSettings);
        }
// @ts-ignore
        if (opts.enableOffline) {
            db.enablePersistence().catch(onError);
        }
// @ts-ignore
        collection = db.collection(opts.objectStoreName);
        return collection;
    };

    const getAsyncDoc = () => {
        const cll = getAsyncCollection();
        const cs = editor.Storage.getCurrentStorage();
        // @ts-ignore
        doc = cll.doc(cs.currentId);
        return doc;
    };

    sm.add(storageName, {
        ...helpers,
        getDoc,

        setDocId(id: any) {
            this.currentId = id;
        },

        async load(_keys) {
            const _doc = getAsyncDoc();
            const doc = await _doc.get();
            return doc.exists ? doc.data() : {};
        },

        async loadAll() {
            const cll = getAsyncCollection();
            const docs = await cll.get();
            const data: any[] = [];
            docs.forEach((doc: { data: () => any; }) => data.push(doc.data()));
            return data;
        },

        async store(data) {
            const cll = getAsyncCollection();
            await cll.doc(data.id || this.currentId).set({
                id: this.currentId,
                name: this.currentName,
                template: this.isTemplate,
                thumbnail: this.currentThumbnail,
                description: this.description,
                updated_at: Date.now(),
                ...data
            });
        },

        async update(data: { [x: string]: any; id: any; }) {
            const { id, ..._data } = data;
            const cll = getAsyncCollection();
            await cll.doc(id).set(_data, { merge: true });
        },

        async delete(index: any) {
            if (!index) {
                const _doc = getAsyncDoc();
                await _doc.delete();
            } else {
                const cll = getAsyncCollection();
                await cll.doc(index).delete();
            }
        }
    });
}