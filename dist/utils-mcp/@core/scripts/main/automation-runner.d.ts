import { AutomationControl } from "../control/automation-control";
import { CommunicationControl } from "../control/communication-control";
interface AutomationConfig {
    rootDir: string;
    syncInterval: number;
    logLevel: "debug" | "info" | "warn" | "error";
}
export declare class AutomationRunner {
    private automationControl;
    private communicationControl;
    private config;
    constructor(config: AutomationConfig);
    private setupLogging;
    private initializeControls;
    start(): Promise<void>;
    validateAll(): Promise<boolean>;
    getAutomationControl(): AutomationControl;
    getCommunicationControl(): CommunicationControl;
}
export {};
