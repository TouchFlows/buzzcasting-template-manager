import indexeddb from '@/storage/indexeddb';
import remote from '@/storage/remote';
import firestore from '@/storage/firestore';
import { Editor } from 'grapesjs';

export default (editor: Editor, opts = {}) => {
    // Load indexeddb storage
    indexeddb(editor, opts);

    // Load remote storage
    remote(editor, opts);

    // Load firestore storage
    firestore(editor, opts);
}