declare module 'commander' {
  export class Command {
    name(name: string): this;
    description(description: string): this;
    version(version: string): this;
    option(flags: string, description: string, defaultValue?: unknown): this;
    parse(argv?: string[]): this;
    opts(): CommandOptions;
  }

  interface CommandOptions {
    path: string;
    templates: string;
    output: string;
    debug: boolean;
  }
}

declare module 'winston' {
  export interface LoggerOptions {
    level: string;
    format: LogFormat;
    transports: Transport[];
  }

  interface LogFormat {
    combine(...formats: LogFormat[]): LogFormat;
    timestamp(): LogFormat;
    printf(fn: (info: LogInfo) => string): LogFormat;
    colorize(): LogFormat;
    simple(): LogFormat;
  }

  interface LogInfo {
    timestamp: string;
    level: string;
    message: string;
    [key: string]: unknown;
  }

  interface Transport {
    filename?: string;
    level?: string;
    format?: LogFormat;
  }

  export const format: LogFormat;

  export class transports {
    static File: new (options: Transport) => Transport;
    static Console: new (options: Transport) => Transport;
  }

  export function createLogger(options: LoggerOptions): Logger;

  interface Logger {
    error(message: string, meta?: unknown): void;
    warn(message: string, meta?: unknown): void;
    info(message: string, meta?: unknown): void;
    debug(message: string, meta?: unknown): void;
  }
}

declare module 'handlebars' {
  export interface TemplateDelegate<T = unknown> {
    (context: T): string;
  }

  export function compile<T = unknown>(template: string): TemplateDelegate<T>;
  export function registerPartial(name: string, template: string): void;
  export function registerHelper(name: string, helper: HelperDelegate): void;
  export type HelperDelegate = (...args: unknown[]) => unknown;
}

declare module 'fs-extra' {
  export function ensureDirSync(path: string): void;
  export function ensureDir(path: string): Promise<void>;
  export function readFile(path: string, encoding: string): Promise<string>;
  export function writeFile(path: string, data: string, encoding: string): Promise<void>;
  export function readdir(path: string): Promise<string[]>;
  export function statSync(path: string): { mtime: Date };
  export function copy(src: string, dest: string): Promise<void>;
  export function remove(path: string): Promise<void>;
  export function unlink(path: string): Promise<void>;
  export function pathExists(path: string): Promise<boolean>;
}

declare module 'path' {
  export function join(...paths: string[]): string;
  export function resolve(...paths: string[]): string;
  export function basename(path: string, ext?: string): string;
  export function dirname(path: string): string;
}

export interface SystemEnvironment {
  name: string;
  description: string;
}

export interface FileDescription {
  path: string;
  description: string;
}

export interface ManualTemplateData {
  systemName: string;
  systemPurpose: string;
  environments: Array<{
    name: string;
    description: string;
  }>;
  projectRoot: string;
  directoryStructure: string;
  fileDescriptions: Array<{
    path: string;
    description: string;
  }>;
  validationCriteria: Array<{
    title: string;
    description: string;
  }>;
  validationMethods: Array<{
    title: string;
    description: string;
  }>;
  validationResults: Array<{
    title: string;
    description: string;
  }>;
  pipelines: Array<{
    index: number;
    name: string;
    steps: string[];
  }>;
  features: Array<{
    index: number;
    name: string;
    details: string[];
  }>;
  backupManagement: Array<{
    title: string;
    description: string;
  }>;
  structuralAspects: Array<{
    title: string;
    description: string;
  }>;
  functionalAspects: Array<{
    title: string;
    description: string;
  }>;
  codeQuality: Array<{
    title: string;
    description: string;
  }>;
  extensibility: Array<{
    title: string;
    description: string;
  }>;
  basicCommand: string;
  pathCommand: string;
  changes: Array<{
    date: string;
    description: string;
  }>;
  generated_date: string;
}
