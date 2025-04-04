export type ErrorCategory = "plugin" | "api" | "ui" | "build";
export type ErrorSeverity = "low" | "medium" | "high" | "critical";
export type ErrorPriority = "low" | "medium" | "high";
export interface ErrorCase {
    id: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    priority: ErrorPriority;
    description: string;
    fix?: () => Promise<void>;
    relatedErrors?: string[];
}
export interface ErrorDocument {
    id: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    status: string;
    description: string;
    problemCode: string;
    solution: string;
    autoDetect: string;
    autoFix: string;
    occurrences: string;
    lastOccurrence: string;
    fixed: string;
    relatedErrors: string;
    resolutionHistory: string;
    lastUpdate: string;
}
export declare const BUILD_PATTERNS: {
    DESTRUCTURING: {
        id: string;
        pattern: RegExp;
        category: ErrorCategory;
        severity: ErrorSeverity;
        priority: ErrorPriority;
        description: string;
        isFigmaSpecific: boolean;
        fix: (filePath: string, match: RegExpMatchArray) => Promise<void>;
    };
};
export declare const PLUGIN_PATTERNS: {
    INIT_ERROR: {
        id: string;
        pattern: RegExp;
        category: ErrorCategory;
        severity: ErrorSeverity;
        priority: ErrorPriority;
        description: string;
        isFigmaSpecific: boolean;
    };
};
export declare const API_PATTERNS: {
    AUTH_ERROR: {
        id: string;
        pattern: RegExp;
        category: ErrorCategory;
        severity: ErrorSeverity;
        priority: ErrorPriority;
        description: string;
        isFigmaSpecific: boolean;
    };
};
export declare const UI_PATTERNS: {
    RENDER_ERROR: {
        id: string;
        pattern: RegExp;
        category: ErrorCategory;
        severity: ErrorSeverity;
        priority: ErrorPriority;
        description: string;
        isFigmaSpecific: boolean;
    };
};
