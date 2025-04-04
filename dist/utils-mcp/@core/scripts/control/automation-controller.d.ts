interface MonitoringMetrics {
    itemCount: number;
    activeItems: number;
    errorCount: number;
    lastCheck: Date;
}
export declare class AutomationController {
    private eventEmitter;
    private rootDir;
    private items;
    private metrics;
    constructor(rootDir: string);
    private setupEventHandlers;
    private validateItemStructure;
    private updateItemStatus;
    private getItemType;
    private updateMetrics;
    private checkOptimization;
    createNewItem(itemName: string): Promise<void>;
    startMonitoring(): Promise<void>;
    generateManual(templatePath: string): Promise<void>;
    private generateMarkdown;
    getMetrics(): MonitoringMetrics;
}
export {};
