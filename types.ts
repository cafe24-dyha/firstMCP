import { TemplateDelegate } from 'handlebars';

export type HandlebarsTemplateDelegate = TemplateDelegate<ManualTemplateData>;

export interface SystemConfig {
  debug?: boolean;
  logLevel?: string;
  maxBackups?: number;
  templateDir: string;
  outputDir: string;
}

export interface TemplateContext {
  title: string;
  version: string;
  author: string;
  date: string;
  description: string;
  setup: string[];
  features: string[];
  configuration: {
    [key: string]: string | number | boolean;
  };
  dependencies?: string[];
  changes?: {
    version: string;
    date: string;
    description: string;
  }[];
}

export interface ManualGeneratorOptions {
  inputDir: string;
  outputDir: string;
  templateDir: string;
  debug?: boolean;
}

export interface LoggerOptions {
  level: string;
  logDir: string;
  debug?: boolean;
}

export interface TemplateManagerOptions {
  templateDir: string;
  backupDir: string;
  maxBackups: number;
  debug?: boolean;
}

export interface ManualTemplateData {
  project: {
    name: string;
    path: string;
    manualPath: string;
  };
  projectRoot: string;
  systemName: string;
  systemPurpose: string;
  systemEnvironment: string;
  directoryStructure: string;
  keyFiles: Array<{ name: string; description: string }>;
  mainFeatures: string[];
  figmaMcpFeatures: Array<{
    name: string;
    description: string;
  }>;
  figmaIntegration: Array<{
    category: string;
    features: Array<{
      name: string;
      description: string;
    }>;
  }>;
  automationScripts: {
    componentGeneration: string;
    styleUpdates: string;
    assetExport: string;
  };
  plugins: {
    designSystem: string;
    codeGenerator: string;
    assetManager: string;
  };
  implementation: {
    structure: string;
    functionality: string;
    quality: string;
    extensibility: string;
  };
  changes: Array<{
    date: string;
    description: string;
  }>;
  pipeline: {
    design: string;
    development: string;
    automation: string;
  };
  validation: {
    criteria: string[];
    methods: string[];
  };
  validationCriteria: string[];
  validationMethods: string[];
  validationResults: string[];
  integrationFeatures: {
    apiEndpoints: string;
    authentication: string;
    dataSync: string;
  };
  cliExamples: string[];
  recentChanges: string[];
  version: string;
  description: string;
  author: string;
  timestamp: string;
}

export interface BackupFile {
  name: string;
  path: string;
  mtime: number;
}

export interface ChangeRecord {
  type: string;
  description: string;
  timestamp: string;
  status: string;
  author?: string;
  scope?: string;
  relatedFiles?: string[];
}
