declare class MCPErrorIntegration {
    private config;
    constructor();
    private loadConfig;
    private setupMCPIntegration;
    private setupBrowserToolsIntegration;
    private setupErrorDetection;
    private setupAutomaticDocumentation;
    handleMCPError(error: Error): Promise<void>;
}
export declare const mcpErrorIntegration: MCPErrorIntegration;
export {};
