export function isNullOrWhiteSpace(str: string | null | undefined) {
    return str === null || str === undefined || str.trim().length === 0;
}