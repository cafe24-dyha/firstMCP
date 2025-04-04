interface CommunicationEvent {
    type: "itemChange" | "manualUpdate" | "scriptUpdate";
    source: string;
    target?: string;
    data: any;
    timestamp: Date;
}
interface SyncConfig {
    interval: number;
    strategy: "immediate" | "interval" | "manual";
    retryCount: number;
}
export declare class CommunicationController {
    private eventEmitter;
    private eventHistory;
    private syncConfig;
    private isMonitoring;
    constructor();
    private setupEventHandlers;
    private handleItemChange;
    private handleManualUpdate;
    private handleScriptUpdate;
    private notifyDependentItems;
    private findDependentItems;
    private synchronizeState;
    private validateState;
    private updateManualFile;
    private updateScriptFile;
    private validateDependencies;
    private checkDependencyExists;
    setSyncConfig(config: Partial<SyncConfig>): void;
    startMonitoring(rootDir: string): Promise<void>;
    stopMonitoring(): void;
    getEventHistory(): CommunicationEvent[];
}
export {};
