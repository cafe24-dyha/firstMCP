import { TemplateManager } from './template-manager';
export declare class ManualGenerator {
    private templateManager;
    private outputDir;
    constructor(templateManager: TemplateManager, outputDir: string);
    generateManual(): Promise<void>;
}
