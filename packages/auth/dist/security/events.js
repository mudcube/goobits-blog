export function createAuthEvent(input) {
    return {
        timestamp: new Date().toISOString(),
        ...input,
    };
}
//# sourceMappingURL=events.js.map