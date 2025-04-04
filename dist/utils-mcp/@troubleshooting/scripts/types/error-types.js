"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UI_PATTERNS = exports.API_PATTERNS = exports.PLUGIN_PATTERNS = exports.BUILD_PATTERNS = void 0;
// 빌드 에러 패턴
exports.BUILD_PATTERNS = {
    DESTRUCTURING: {
        id: "BE001",
        pattern: /Transforming destructuring to the configured target environment .* is not supported yet/,
        category: "BUILD_SYSTEM",
        severity: "WARNING",
        priority: "HIGH",
        description: "esbuild destructuring transform error",
        isFigmaSpecific: true,
        fix: async (filePath, match) => {
            // 자동 수정 로직은 error-fixer.ts에서 구현
        },
    },
};
// 플러그인 에러 패턴
exports.PLUGIN_PATTERNS = {
    INIT_ERROR: {
        id: "PE001",
        pattern: /Failed to initialize plugin/,
        category: "PLUGIN_CORE",
        severity: "CRITICAL",
        priority: "HIGH",
        description: "Plugin initialization error",
        isFigmaSpecific: true,
    },
};
// API 에러 패턴
exports.API_PATTERNS = {
    AUTH_ERROR: {
        id: "AE001",
        pattern: /API authentication failed/,
        category: "FIGMA_API",
        severity: "CRITICAL",
        priority: "HIGH",
        description: "API authentication error",
        isFigmaSpecific: true,
    },
};
// UI 에러 패턴
exports.UI_PATTERNS = {
    RENDER_ERROR: {
        id: "UE001",
        pattern: /Failed to render component/,
        category: "UI_COMPONENT",
        severity: "WARNING",
        priority: "MEDIUM",
        description: "UI rendering error",
        isFigmaSpecific: true,
    },
};
//# sourceMappingURL=error-types.js.map