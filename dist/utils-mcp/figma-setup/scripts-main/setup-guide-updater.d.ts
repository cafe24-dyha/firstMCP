export declare class SetupManualUpdater {
    private projectRoot;
    private manualPath;
    private templatePath;
    private readonly WATCH_DEBOUNCE;
    private updateTimeout;
    constructor(projectRoot: string);
    updateManual(): Promise<void>;
    private readPackageJson;
    private generateManualContent;
    private generateDependenciesSection;
    private generateFileStructureSection;
    private generateValidationStepsSection;
    private generateBuildCommandsSection;
    private writeManual;
    watchForChanges(): void;
}
