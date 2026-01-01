export function isNullOrWhiteSpace(str: string | null | undefined) {
    return str === null || str === undefined || str.trim().length === 0;
}

export function removeAccents(text: string) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}