export function requireColumn(table, column) {
    const found = table[column];
    if (!found) {
        throw new Error(`Missing column '${column}' in drizzle table configuration`);
    }
    return found;
}
export function requireCondition(condition) {
    if (!condition) {
        throw new Error("Missing SQL condition");
    }
    return condition;
}
//# sourceMappingURL=drizzle-types.js.map