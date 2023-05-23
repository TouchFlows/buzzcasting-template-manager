import { Editor } from 'grapesjs';
import UI from '@/utils/ui';
import { ulid } from 'ulid';

export default class PagesApp extends UI {
    constructor(editor: Editor, opts = {}) {
        super(editor, opts);
        this.addPage = this.addPage.bind(this);
        this.selectPage = this.selectPage.bind(this);
        this.removePage = this.removePage.bind(this);
        this.isSelected = this.isSelected.bind(this);
        this.handleNameInput = this.handleNameInput.bind(this);
        this.openEdit = this.openEdit.bind(this);

        /* Set initial app state */
        // @ts-ignore
        this.state = {
            editablePageId: '',
            isShowing: true,
            nameText: '',
            pages: [],
            loading: false
        };
    }

    get editableId() {
        return this.state.editablePageId;
    }

    onRender() {
        const { pm, setState, editor } = this;
        setState({
            loading: true
        });
        setState({
            pages: [...pm.getAll()]
        });
        editor.on('page', () => {
            setState({
                pages: [...pm.getAll()]
            })
        });
        setState({
            loading: false
        });
    }

    isSelected(page: any) {
        // @ts-ignore
        return this.pm.getSelected().id === page.id;
    }

    selectPage(e: any) {
        this.pm.select(e.currentTarget.dataset.key);
        this.update();
    }

    removePage(e: any) {
        // @ts-ignore
        if (this.opts.confirmDeleteProject()) {
            this.pm.remove(e.currentTarget.dataset.key);
            this.update();
        }
    }

    openEdit(e: any) {
        const { editor } = this;
        this.setStateSilent({
            editablePageId: e.currentTarget.dataset.key
        });
        editor.Modal.close();
        // @ts-ignore
        editor.SettingsApp.setTab('page');
        editor.runCommand('open-settings');
    }

    editPage(id: string, name: string) {
        const currentPage = this.pm.get(id);
        currentPage.set('name', name);
        this.update()
    }

    addPage() {
        const { pm } = this;
        // @ts-ignore
        const { nameText } = this.state
        if (!nameText) return;
        pm.add({
            id: ulid(),
            name: nameText,
            component: ''
        });
        this.update();
    }

    handleNameInput(e: any) {
        this.setStateSilent({
            nameText: e.target.value.trim()
        })
    }

    renderPagesList() {
        // @ts-ignore
        const { pages, loading } = this.state;
        // @ts-ignore
        const { opts, isSelected } = this;

        if (loading) return opts.loader || '<div>Loading slides...</div>';

        return pages.map((page: any, i: number) => `<div 
                data-id="${i}" 
                data-key="${page.get('private') ? '' : (page.id || page.get('name'))}"  
                class="page ${isSelected(page) ? 'selected' : ''}"
            >
                <i class="fa fa-file-o" style="margin:5px;"></i>
                ${page.get('name') || page.id}
                ${isSelected(page) || page.get('internal') ? '' : `<span class="page-close" data-key="${page.id || page.get('name')}">&Cross;</span>`}
                ${page.get('internal') ? '' : `<span class="page-edit" data-key="${page.id || page.get('name')}"><i class="fa fa-hand-pointer-o"></i></span>`}
            </div>`).join("\n");
    }

    update() {
        // @ts-ignore
        this.$el?.find('.pages').html(this.renderPagesList());
        // @ts-ignore
        this.$el?.find('.page').on('click', this.selectPage);
        // @ts-ignore
        this.$el?.find('.page-edit').on('click', this.openEdit);
        // @ts-ignore
        this.$el?.find('.page-close').on('click', this.removePage);
    }

    render() {
        const { $, editor } = this;

        // Do stuff on render
        this.onRender();
        this.$el?.remove();

        const cont = $(`<div style="display: ${this.state.isShowing ? 'flex' : 'none'};" class="pages-wrp">
                <div class="pages">
                    ${this.renderPagesList()}
                </div>
                <div  class="flex-row">
                    <input 
                        class="tm-input sm" 
                        type="text" 
                        placeholder="${editor.I18n.t('presentation-manager.pages.placeholder')}" 
                    />
                </div>
                <div class="add-page">
                    ${editor.I18n.t('presentation-manager.pages.new')}
                </div>
            </div>`);
        cont.find('.add-page').on('click', this.addPage);
        cont.find('input').on('change', this.handleNameInput);

        this.$el = cont;
        return cont;
    }

    // @ts-ignore
    get findPanel(): any {
        return this.editor.Panels.getPanel('views-container');
    }

    showPanel() {
        this.state.isShowing = true;
        // @ts-ignore
        this.findPanel.set('appendContent', this.render()).trigger('change:appendContent');
        this.update();
    }

    hidePanel() {
        this.state.isShowing = false;
        this.render();
    }
}