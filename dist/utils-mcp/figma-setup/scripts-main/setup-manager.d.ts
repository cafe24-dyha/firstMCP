interface SetupConfig {
    pluginName: string;
    version: string;
    isPlugin: boolean;
}
export declare class SetupManager {
    private errorHandler;
    private errorLogger;
    private errorFixer;
    private config;
    constructor(config: SetupConfig);
    initialize(): Promise<void>;
    private initializeEnvironment;
    private setupPluginEnvironment;
    private initializeErrorHandling;
    private handleSetupError;
    private validateTSConfig;
    private validateDirectoryStructure;
    private validateDependencies;
    private validatePluginTypes;
    private validateUIComponents;
    private validateMessageHandling;
}
export {};
