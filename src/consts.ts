export const storageIDB = 'indexeddb',
    storageRemote = 'rest-api',
    storageFireStore = 'firestore',
    helpers = {
        currentName: 'Default',
        currentId: 'uuidv4',
        currentThumbnail: '',
        isTemplate: false,
        description: 'No description',

        setId(id: string) {
            this.currentId = id;
        },

        setName(name: string) {
            this.currentName = name;
        },

        setThumbnail(thumbnail: string) {
            this.currentThumbnail = thumbnail;
        },

        setIsTemplate(isTemplate: boolean) {
            this.isTemplate = !!isTemplate;
        },

        setDescription(description: string) {
            this.description = description;
        },
    };