export default {

    resetStorage(): void {
        indexedDB.deleteDatabase('soukai');
        indexedDB.deleteDatabase('soukai-meta');
    },

};
