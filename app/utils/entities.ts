export function lastSeenAt(entity: {
    createdAt: number,
    updatedAt: number,
    lastRequestedAt: number,
}) {
    return Math.max(entity.createdAt, entity.updatedAt, entity.lastRequestedAt);
}