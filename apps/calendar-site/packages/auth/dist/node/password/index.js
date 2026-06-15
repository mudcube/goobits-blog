import { hash, verify } from '@node-rs/argon2';

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/utils/logger.ts
var logger_exports = {};
__export(logger_exports, {
  getLogger: () => getLogger,
  setLogger: () => setLogger
});
function setLogger(logger) {
  if (!logger) {
    activeLoggers = [];
    return;
  }
  if (!activeLoggers.includes(logger)) {
    activeLoggers.push(logger);
  }
}
function getLogger() {
  if (activeLoggers.length === 0) {
    return {
      debug: noop,
      info: noop,
      warn: noop,
      error: noop
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
    error: (...args) => forward("error", args)
  };
}
var noop, activeLoggers;
var init_logger = __esm({
  "src/utils/logger.ts"() {
    noop = () => {
    };
    activeLoggers = [];
  }
});
async function hashPassword(password) {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }
  return await hash(password);
}
async function verifyPassword(storedHash, password) {
  if (!storedHash || !password) {
    return false;
  }
  try {
    return await verify(storedHash, password);
  } catch (error) {
    const { getLogger: getLogger2 } = await Promise.resolve().then(() => (init_logger(), logger_exports));
    getLogger2().error?.("Password verification error:", error);
    return false;
  }
}
function validatePasswordStrength(password) {
  const errors = [];
  if (!password) {
    errors.push("Password is required");
    return { valid: false, errors };
  }
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  return {
    valid: errors.length === 0,
    errors
  };
}

export { hashPassword, validatePasswordStrength, verifyPassword };
