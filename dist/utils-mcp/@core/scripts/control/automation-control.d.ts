interface AutomationPrinciples {
    naming: {
        pattern: string;
        rules: string[];
    };
    directory: {
        structure: string[];
        conventions: string[];
    };
    communication: {
        protocol: string;
        events: string[];
        sync: {
            interval: number;
            strategy: string;
        };
    };
}
export declare class AutomationControl {
    private eventEmitter;
    private principles;
    private rootDir;
    private manualGenerator;
    constructor(rootDir: string);
    private setupEventHandlers;
    validateItemStructure(itemPath: string): Promise<boolean>;
    validateScript(scriptPath: string): Promise<boolean>;
    monitorChanges(): Promise<void>;
    getPrinciples(): AutomationPrinciples;
    generateAllManuals(): Promise<void>;
}
export {};
