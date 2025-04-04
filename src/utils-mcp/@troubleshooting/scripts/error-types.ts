export type ErrorCategory =
  | "browser"
  | "figma"
  | "network"
  | "validation"
  | "system"
  | "typescript"
  | "plugin"
  | "ui";

export type ErrorSeverity = "critical" | "error" | "warning" | "info";

export type ErrorType =
  | "runtime"
  | "browser"
  | "violation"
  | "network"
  | "validation"
  | "figma"
  | "SETUP_ERROR"
  | "PLUGIN_ERROR"
  | "TYPESCRIPT_ERROR"
  | "UI_ERROR"
  | "TYPE_ERROR"
  | "PROP_ERROR"
  | "SYNTAX_ERROR"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR";

export interface BaseError {
  type: ErrorType;
  message: string;
  stack?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export interface SetupError extends BaseError {
  type: "SETUP_ERROR";
  context: {
    config: {
      pluginName: string;
      version: string;
      isPlugin: boolean;
    };
    stackTrace?: string;
  };
}

export interface PluginError extends BaseError {
  type: "PLUGIN_ERROR";
  context: {
    pluginId: string;
    componentName?: string;
    functionName?: string;
  };
}

export interface TypeScriptError extends BaseError {
  type: "TYPESCRIPT_ERROR";
  context: {
    fileName: string;
    lineNumber?: number;
    columnNumber?: number;
    code?: string;
  };
}

export interface UIError extends BaseError {
  type: "UI_ERROR";
  context: {
    componentName: string;
    props?: Record<string, unknown>;
    state?: Record<string, unknown>;
  };
}

export interface ErrorHandlerConfig {
  autoFix?: boolean;
  notifyOnError?: boolean;
  logToFile?: boolean;
  maxRetries?: number;
  timeout?: number;
  documentationPath?: string;
  scriptPath?: string;
}

export interface ErrorLoggerConfig {
  logDirectory: string;
  historyLimit: number;
  minSeverity?: ErrorSeverity;
  format?: "json" | "text";
}

export interface ErrorFixerConfig {
  maxAttempts: number;
  fixTimeout: number;
  backoffFactor?: number;
  retryDelay?: number;
}

export interface ErrorHandlerBase {
  handleError(error: BaseError): Promise<void>;
  setConfig(config: ErrorHandlerConfig): void;
}

export interface ErrorHandler extends ErrorHandlerBase {
  handleError(error: Error | MCPError | BaseError): Promise<void>;
}

export type ErrorLogger = {
  log: (entry: ErrorLogEntry) => Promise<void>;
  initialize: (config: ErrorLoggerConfig) => Promise<void>;
  getHistory: () => Promise<ErrorLogEntry[]>;
};

export type ErrorFixer = {
  fix: (
    error: BaseError,
    options: { category: string; maxAttempts: number; timeout: number }
  ) => Promise<boolean>;
  setRules: (config: ErrorFixerConfig) => void;
};

export type MCPErrorIntegration = {
  handleError: (error: BaseError) => Promise<void>;
  initialize: () => Promise<void>;
};

export interface BrowserError extends BaseError {
  type: "browser";
  context?: {
    url?: string;
    userAgent?: string;
    timestamp: number;
  };
}

export interface ViolationError extends BaseError {
  type: "violation";
  description: string;
  solution?: string;
  category: "accessibility" | "performance" | "security" | "other";
}

export interface NetworkError extends BaseError {
  type: "network";
  context: {
    url: string;
    method: string;
    status?: number;
    response?: unknown;
  };
}

export interface ValidationError extends BaseError {
  type: "validation";
  context: {
    field: string;
    value: unknown;
    constraints: Record<string, string>;
  };
}

export interface FigmaError extends BaseError {
  type: "figma";
  pluginId?: string;
  nodeId?: string;
  action?: string;
}

export type MCPError =
  | BrowserError
  | ViolationError
  | NetworkError
  | ValidationError
  | FigmaError;

export interface ErrorLogEntry extends BaseError {
  id: string;
  severity: ErrorSeverity;
  resolved: boolean;
  resolution?: {
    timestamp: Date;
    method: string;
    autoFixed: boolean;
    description?: string;
  };
  context?: Record<string, unknown>;
}

export interface ErrorFixResult {
  success: boolean;
  error?: BaseError;
  changes?: {
    file: string;
    description: string;
    timestamp: Date;
  }[];
}

export interface ErrorDocument {
  id: string;
  title: string;
  description: string;
  steps: string[];
  solution?: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  created: Date;
  updated: Date;
  status: "open" | "resolved" | "in-progress";
}

export const ERROR_PATTERNS = {
  BUILD: {
    DESTRUCTURING:
      /Transforming destructuring to the configured target environment .* is not supported yet/,
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

export function createBaseError(error: Error): BaseError {
  return {
    type: "runtime",
    message: error.message,
    stack: error.stack,
    timestamp: new Date(),
  };
}

export function isBaseError(error: unknown): error is BaseError {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    "message" in error &&
    "timestamp" in error &&
    error.timestamp instanceof Date
  );
}

export function isMCPError(error: unknown): error is MCPError {
  return (
    isBaseError(error) &&
    (error.type === "browser" ||
      error.type === "violation" ||
      error.type === "network" ||
      error.type === "validation" ||
      error.type === "figma")
  );
}
