/**
 * GitHub 자동 배포 유틸리티
 * 이슈 수정 시 자동으로 GitHub에 배포하는 기능을 담당
 */
export interface GitHubConfig {
    enabled: boolean;
    repository: string;
    branch: string;
    commitMessage: string;
    autoMerge: boolean;
}
export interface DeploymentResult {
    success: boolean;
    timestamp: number;
    commitHash?: string;
    error?: string;
}
export declare class GitHubDeployer {
    private config;
    private deploymentHistory;
    constructor(config?: Partial<GitHubConfig>);
    /**
     * GitHub에 변경사항 배포
     * @param issue 이슈 설명
     * @param fixedFiles 수정된 파일 경로 목록
     * @param manualPath 매뉴얼 파일 경로
     */
    deploy(issue: string, fixedFiles: string[], manualPath: string): Promise<DeploymentResult>;
    /**
     * 배포 활성화 상태 확인
     */
    isEnabled(): boolean;
    /**
     * 배포 설정 업데이트
     */
    updateConfig(config: Partial<GitHubConfig>): void;
    /**
     * 배포 활성화/비활성화 설정
     */
    setEnabled(enabled: boolean): void;
    /**
     * 배포 이력 가져오기
     */
    getDeploymentHistory(): Array<{
        timestamp: number;
        issue: string;
        success: boolean;
        commitHash?: string;
        error?: string;
    }>;
}
export declare const githubDeployer: GitHubDeployer;
