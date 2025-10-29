export function localStorageChanged(key: string) {
    window.dispatchEvent(new StorageEvent("local-storage", { key }));
}