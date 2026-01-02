export const isMac = /mac/i.test(navigator.userAgent);

export function isEditableElement(element: Element) {
    // This may not be all
    return element.nodeName === "INPUT" ||
        element.nodeName === "TEXTAREA" ||
        element.nodeName === "SELECT";
}

export function isCtrl(e: React.KeyboardEvent<Element> | KeyboardEvent) {
    return isMac ? e.metaKey : e.ctrlKey;
}