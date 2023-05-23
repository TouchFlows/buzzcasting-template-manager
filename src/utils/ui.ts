import { Editor, IStorage, StorageOptions } from "grapesjs";

export default class UI {
    editor: Editor
    pfx: string
    state: any
    $el: any
    $: any
    opts: any
    
    constructor(editor: Editor, opts = {}) {
        this.editor = editor;
        // @ts-ignore
        this.$ = editor.$;
        // @ts-ignore
        this.pfx = editor.getConfig('stylePrefix');
        // @ts-ignore
        this.opts = opts;
        this.setState = this.setState.bind(this);
        this.setStateSilent = this.setStateSilent.bind(this);
        this.onRender = this.onRender.bind(this);
        this.handleTabs = this.handleTabs.bind(this);
    }

    setState(state: any) {
        // @ts-ignore
        this.state = { ...this.state, ...state };
        // @ts-ignore
        this.update();
    }

    setStateSilent(state: any) {
        // @ts-ignore
        this.state = { ...this.state, ...state };
    }

    // @ts-ignore
    get sm(): StorageManager {
        // @ts-ignore
        return this.editor.Storage;
    }

    // @ts-ignore
    get cs(): IStorage<StorageOptions>{
        return this.editor.Storage.getCurrentStorage();
    }

    // @ts-ignore
    get pm(): any {
        return this.editor.Pages;
    }

    onRender() { }

    handleTabs() { }
}