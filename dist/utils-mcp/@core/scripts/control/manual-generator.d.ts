interface ManualTemplate {
    title: string;
    sections: ManualSection[];
    lastUpdate: Date;
}
interface ManualSection {
    title: string;
    content: string;
    subsections?: ManualSection[];
}
export declare class ManualGenerator {
    private templatesDir;
    private manualsDir;
    constructor(rootDir: string);
    private loadTemplate;
    private saveManual;
    private generateMarkdown;
    private generateSection;
    generateManual(templateName: string): Promise<void>;
    updateManual(templateName: string, updates: Partial<ManualTemplate>): Promise<void>;
}
export {};
