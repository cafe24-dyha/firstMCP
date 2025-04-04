export const __esModule: boolean;
export class ManualGenerator {
    constructor(templateDir: any, outputDir: any);
    templateDir: any;
    outputDir: any;
    initializeDirectories(): void;
    generateManual(templateName: any, data: any): Promise<any>;
    registerPartial(name: any, partialPath: any): Promise<void>;
    registerHelper(name: any, helper: any): void;
}
