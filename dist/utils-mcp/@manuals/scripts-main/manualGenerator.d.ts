import handlebars from 'handlebars';
/**
 * manualGenerator.ts
 *
 * 매뉴얼 생성을 담당하는 모듈입니다.
 * - Handlebars 템플릿 엔진을 사용하여 매뉴얼을 생성합니다.
 * - 템플릿 파일을 로드하고 처리합니다.
 * - 생성된 매뉴얼을 저장합니다.
 */
export interface ManualData {
    title: string;
    version: string;
    author: string;
    date: string;
    description: string;
    setup?: string[];
    features?: string[];
    configuration?: Record<string, unknown>;
}
export declare class ManualGenerator {
    private templateDir;
    private outputDir;
    constructor(templateDir: string, outputDir: string);
    private initializeDirectories;
    generateManual(templateName: string, data: ManualData): Promise<string>;
    registerPartial(name: string, partialPath: string): Promise<void>;
    registerHelper(name: string, helper: handlebars.HelperDelegate): void;
}
