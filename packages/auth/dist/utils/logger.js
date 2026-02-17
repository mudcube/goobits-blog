const noop = () => { };
let activeLoggers = [];
export function setLogger(logger) {
    if (!logger) {
        activeLoggers = [];
        return;
    }
    if (!activeLoggers.includes(logger)) {
        activeLoggers.push(logger);
    }
}
export function getLogger() {
    if (activeLoggers.length === 0) {
        return {
            debug: noop,
            info: noop,
            warn: noop,
            error: noop,
        };
    }
    const forward = (level, args) => {
        for (const logger of activeLoggers) {
            logger[level]?.(...args);
        }
    };
    return {
        debug: (...args) => forward("debug", args),
        info: (...args) => forward("info", args),
        warn: (...args) => forward("warn", args),
        error: (...args) => forward("error", args),
    };
}
//# sourceMappingURL=logger.js.map