"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMCPError = exports.isBaseError = exports.createBaseError = exports.ERROR_PATTERNS = void 0;
exports.ERROR_PATTERNS = {
    BUILD: {
        DESTRUCTURING: /Transforming destructuring to the configured target environment .* is not supported yet/,
        TYPE_ERROR: /TypeScript error: (.*)/,
        BUNDLE_ERROR: /Failed to bundle (.*)/,
    },
    PLUGIN: {
        INIT_ERROR: /Failed to initialize plugin/,
        NODE_ERROR: /Cannot manipulate node/,
        MESSAGE_ERROR: /Plugin message error/,
    },
    API: {
        AUTH_ERROR: /API authentication failed/,
        RATE_LIMIT: /API rate limit exceeded/,
        ENDPOINT_ERROR: /Invalid API endpoint/,
    },
    UI: {
        RENDER_ERROR: /Failed to render component/,
        STATE_ERROR: /Invalid state update/,
        TYPE_ERROR: /Type '(.*)' is not assignable to type/,
    },
};
function createBaseError(error) {
    return {
        type: "runtime",
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
    };
}
exports.createBaseError = createBaseError;
function isBaseError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "type" in error &&
        "message" in error &&
        "timestamp" in error &&
        error.timestamp instanceof Date);
}
exports.isBaseError = isBaseError;
function isMCPError(error) {
    return (isBaseError(error) &&
        (error.type === "browser" ||
            error.type === "violation" ||
            error.type === "network" ||
            error.type === "validation" ||
            error.type === "figma"));
}
exports.isMCPError = isMCPError;
//# sourceMappingURL=error-types.js.map