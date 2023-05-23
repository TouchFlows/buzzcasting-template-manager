import TemplateManager, { PagesApp, SettingsApp } from "@/manager"
import commands from "@/commands"
import storage from "@/storage"
import en from "@/locale/en"
import { Editor } from "grapesjs"
import "@/presentation-manager.css"

export default (editor: Editor, opts = {}) => {
	const options = {
		...{
			// default options
			// Allow migration of projects using deprecated storage prefix
			legacyPrefix: "",
			// Database name
			dbName: "gjs",

			// Collection name
			objectStoreName: "presentations",

			// Load first template in storage
			loadFirst: true,

			// Custom load
			customLoad: false,

			// Add uuid as path parameter to store path for rest-api
			ulidInPath: true,

			// Indexeddb version schema
			indexeddbVersion: 6,

			// Confirm delete project
			confirmDeleteProject() {
				return confirm("Are you sure to delete this presentation")
			},

			// Confirm delete page
			confirmDeletePage() {
				return confirm("Are you sure to delete this slide")
			},

			// When template or page is deleted
			onDelete(res: any) {
				console.log("Deleted:", res)
			},

			// Handle promise from delete
			onDeleteAsync(del: any) {
				return del
			},

			// Handle promise from update
			onUpdateAsync(up: any) {
				return up
			},

			// Handle promise from screenshot
			onScreenshotAsync(shot: any) {
				return shot
			},

			// On screenshot error
			onScreenshotError(err: any) {
				console.log(err)
			},

			// Handle built-in thumbnail generation
			// By default it just sets the url as the base64 encoded image which may be too large to store in a database
			// You might want to upload this somewhere
			onThumbnail(dataUrl: string, $input: any) {
				$input.val(dataUrl)
			},

			// Quality of screenshot image from 0 to 1, more quality increases the image size
			quality: 0.01,

			// Content for templates modal title
			mdlTitle: "Presentation Manager",

			// Show when no pages yet pages
			nopages: '<div style="display:flex;align-items:center;padding:50px;margin:auto;">No Presentations Yet</div>',

			// Firebase API key
			apiKey: "",

			// Firebase Auth domain
			authDomain: "",

			// Cloud Firestore project ID
			projectId: "",

			// Enable support for offline data persistence
			enableOffline: true,

			// Firebase app config
			firebaseConfig: {},

			// Database settings (https://firebase.google.com/docs/reference/js/firebase.firestore.Settings)
			settings: { timestampsInSnapshots: true },

			// Show estimated project statistics
			size: false,

			// Send feedback when open is clicked on current page
			currentPageOpen() {
				console.log("Current slide is already open")
			},

			i18n: {},

			// TailwindCss theme settings
			theme: {},

			// Tailwind Css Directives
			directives: `@tailwind base;
            @tailwind components;
            @tailwind utilities;`
		},
		...opts
	}

	editor.I18n.addMessages({
		en,
		...options.i18n
	})

	// Init and add dashboard object to editor
	// @ts-ignore
	editor.TemplateManager = new TemplateManager(editor, options)
	// @ts-ignore
	editor.PagesApp = new PagesApp(editor, options)
	// @ts-ignore
	editor.SettingsApp = new SettingsApp(editor, options)

	// Load commands
	commands(editor, options)

	// Load storages
	storage(editor, options)

	// Load page with index zero
	editor.on("load", async () => {
		const cs = editor.Storage.getCurrentStorage()
		const { customLoad } = options
		// @ts-ignore
		customLoad && typeof customLoad === "function" && customLoad(editor, cs)
		if (!customLoad) {
			const res = await cs?.loadAll()
			const firstPage = res[0]
			if (firstPage && options.loadFirst) {
				cs?.setId(firstPage.id)
				cs?.setName(firstPage.name)
				cs?.setThumbnail(firstPage.thumbnail)
				cs?.setIsTemplate(firstPage.template)
				// @ts-ignore
				await editor.load()
				editor.stopCommand("sw-visibility")
				editor.runCommand("sw-visibility")
			} else {
				cs?.setId(editor.runCommand("get-ulid"))
				cs?.setName(`Default-${cs.currentId.substr(0, 7)}`)
			}
		}
	})
}
