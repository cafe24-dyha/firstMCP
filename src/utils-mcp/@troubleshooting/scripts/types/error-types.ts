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

// 빌드 에러 패턴
export const BUILD_PATTERNS = {
  DESTRUCTURING: {
    id: "BE001",
    pattern:
      /Transforming destructuring to the configured target environment .* is not supported yet/,
    category: "BUILD_SYSTEM" as ErrorCategory,
    severity: "WARNING" as ErrorSeverity,
    priority: "HIGH" as ErrorPriority,
    description: "esbuild destructuring transform error",
    isFigmaSpecific: true,
    fix: async (filePath: string, match: RegExpMatchArray) => {
      // 자동 수정 로직은 error-fixer.ts에서 구현
    },
  },
};

// 플러그인 에러 패턴
export const PLUGIN_PATTERNS = {
  INIT_ERROR: {
    id: "PE001",
    pattern: /Failed to initialize plugin/,
    category: "PLUGIN_CORE" as ErrorCategory,
    severity: "CRITICAL" as ErrorSeverity,
    priority: "HIGH" as ErrorPriority,
    description: "Plugin initialization error",
    isFigmaSpecific: true,
  },
};

// API 에러 패턴
export const API_PATTERNS = {
  AUTH_ERROR: {
    id: "AE001",
    pattern: /API authentication failed/,
    category: "FIGMA_API" as ErrorCategory,
    severity: "CRITICAL" as ErrorSeverity,
    priority: "HIGH" as ErrorPriority,
    description: "API authentication error",
    isFigmaSpecific: true,
  },
};

// UI 에러 패턴
export const UI_PATTERNS = {
  RENDER_ERROR: {
    id: "UE001",
    pattern: /Failed to render component/,
    category: "UI_COMPONENT" as ErrorCategory,
    severity: "WARNING" as ErrorSeverity,
    priority: "MEDIUM" as ErrorPriority,
    description: "UI rendering error",
    isFigmaSpecific: true,
  },
};
