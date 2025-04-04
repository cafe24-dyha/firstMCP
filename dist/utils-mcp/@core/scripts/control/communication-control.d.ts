interface CommunicationEvent {
    type: string;
    source: string;
    target?: string;
    data: any;
    timestamp: number;
}
interface SyncConfig {
    interval: number;
    strategy: "immediate" | "batch";
    batchSize?: number;
}
export declare class CommunicationControl {
    private eventEmitter;
    private eventLog;
    private syncConfig;
    constructor();
    private setupEventHandlers;
    private logEvent;
    private handleItemChange;
    private handleManualUpdate;
    private handleScriptUpdate;
    private checkDependencies;
    private notifyDependentItem;
    private synchronizeState;
    private validateManual;
    private validateScript;
    private updateRelatedManuals;
    private updateScriptManual;
    getEventLog(): CommunicationEvent[];
    setSyncConfig(config: SyncConfig): void;
    monitorChanges(rootDir: string): Promise<void>;
}
export {};
