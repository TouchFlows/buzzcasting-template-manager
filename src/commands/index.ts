
import * as domtoimage from 'dom-to-image';
import { ulid } from 'ulid';
import openImportCommand from '@/commands/import'
//import { cmdClear, cmdDeviceDesktop, cmdDeviceMobile, cmdDeviceTablet } from './consts';
import { Editor, PluginOptions } from 'grapesjs'

export default (editor: Editor, opts: Required<PluginOptions>) => {
    //const { Commands } = editor;
    //const txtConfirm = opts.textCleanCanvas;
    const cm = editor.Commands;
    const cs = editor.Storage.getCurrentStorage();
    const mdl = editor.Modal;
    const pfx = editor.getConfig('stylePrefix');
    const mdlClass = `${pfx}mdl-dialog-tml`;
    const mdlClassMd = `${pfx}mdl-dialog-md`;

    // @ts-ignore
    editor.domtoimage = domtoimage;

    openImportCommand(editor, opts);

cm.add('open-templates', {
        run(editor, sender) {
            const mdlDialog = document.querySelector(`.${pfx}mdl-dialog`);
            //@ts-ignore
            mdlDialog.classList.add(mdlClass);
            sender?.set && sender.set('active');
            // @ts-ignore
            mdl.setTitle(opts.mdlTitle);
            // @ts-ignore
            mdl.setContent(editor.TemplateManager.render());
            mdl.open();
            mdl.getModel().once('change:open', () => {
                // @ts-ignore
                mdlDialog.classList.remove(mdlClass);
            });
        }
    });

    cm.add('open-settings', {
        run(editor, sender) {
            const mdlDialog = document.querySelector(`.${pfx}mdl-dialog`);
            mdlDialog.classList.add(mdlClassMd);
            sender?.set && sender.set('active');
            // @ts-ignore
            mdl.setTitle(opts.mdlTitle);
            // @ts-ignore
            mdl.setContent(editor.SettingsApp.render());
            mdl.open();
            mdl.getModel().once('change:open', () => {
                mdlDialog.classList.remove(mdlClassMd);
            });
        }
    });

    cm.add('open-pages', {
        run(editor) {
            // @ts-ignore
            editor.PagesApp.showPanel();
        },
        stop(editor) {
            // @ts-ignore
            editor.PagesApp.hidePanel();
        }
    })

    const getJpeg = async (node: Element, options = {}, clb: any, clbErr: any) => {
        try {
            // @ts-ignore
            const dataUrl = await opts.onScreenshotAsync(domtoimage.toJpeg(node, options));
            clb && clb(dataUrl);
        } catch (err) {
            clbErr && clbErr(err)
        }
    };

    cm.add('get-ulid', () => {
        return ulid()
    });

    cm.add('take-screenshot', (editor: Editor, _s: any, options = { clb(d: any) { return d } }) => {
        const el = editor.getWrapper().getEl();
        getJpeg(el, {
            // @ts-ignore
            quality: opts.quality,
            height: 1000,
            'cacheBust': true,
            style: {
                'background-color': 'white',
                ...editor.getWrapper().getStyle()
            },
            // @ts-ignore
        }, options.clb, opts.onScreenshotError);
    });

    cm.add('save-as-template', (editor: Editor) => {
        cs.setIsTemplate(true);
        // @ts-ignore
        editor.store();
    });

    cm.add('delete-template', async (_editor:Editor) => {
        const res = await cs.delete();
        // @ts-ignore
        opts.onDelete(res);
    });

    /*Commands.add(cmdDeviceDesktop, {
      run: (ed) => ed.setDevice('Desktop'),
      stop: () => {},
    });

    Commands.add(cmdDeviceTablet, {
      run: (ed) => ed.setDevice('Tablet'),
      stop: () => {},
    });

    Commands.add(cmdDeviceMobile, {
      run: (ed) => ed.setDevice('Mobile portrait'),
      stop: () => {},
    });

    Commands.add(cmdClear, {
      run: (ed) => {
        const cmd = 'core:canvas-clear';
        if (txtConfirm) {
          confirm(txtConfirm) && ed.runCommand(cmd);
        } else {
          ed.runCommand(cmd);
        }
      }
    });*/
}