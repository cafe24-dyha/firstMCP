export type ErrorSeverity = "low" | "medium" | "high" | "critical";
export type ErrorPriority = "low" | "medium" | "high";
export interface BaseErrorCase {
    id: string;
    category: string;
    severity: ErrorSeverity;
    priority: ErrorPriority;
    description: string;
    pattern: RegExp;
    fix?: () => Promise<void>;
    relatedErrors?: string[];
}
export interface ErrorContext {
    sourceFile?: string;
    lineNumber?: number;
    columnNumber?: number;
    stackTrace?: string;
    environment?: Record<string, any>;
}
export interface ErrorFix {
    id: string;
    description: string;
    automated: boolean;
    fix: () => Promise<void>;
    validation?: () => Promise<boolean>;
    rollback?: () => Promise<void>;
}
export interface ErrorDocument {
    id: string;
    message: string;
    category: string;
    severity: ErrorSeverity;
    status: string;
    description: string;
    context: ErrorContext;
    solution: string;
    autoDetect: boolean;
    autoFix: boolean;
    occurrences: number;
    lastOccurrence: string;
    fixed: boolean;
    relatedErrors: string[];
    resolutionHistory: Array<{
        timestamp: string;
        action: string;
        result: string;
    }>;
}
export interface ErrorStats {
    totalErrors: number;
    fixedErrors: number;
    activeErrors: Set<string>;
    errorsByCategory: Map<string, number>;
    errorsBySeverity: Map<string, number>;
    recentErrors: Array<{
        id: string;
        lastOccurrence: string;
        count: number;
        fixed: boolean;
    }>;
}
