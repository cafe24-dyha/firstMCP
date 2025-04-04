"use strict";
/**
 * GitHub 자동 배포 유틸리티
 * 이슈 수정 시 자동으로 GitHub에 배포하는 기능을 담당
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubDeployer = exports.GitHubDeployer = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs/promises"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class GitHubDeployer {
    constructor(config) {
        this.config = {
            enabled: true,
            repository: "",
            branch: "main",
            commitMessage: "fix: 자동 오류 수정 및 트러블슈팅 가이드 업데이트",
            autoMerge: false,
            ...config,
        };
        this.deploymentHistory = [];
    }
    /**
     * GitHub에 변경사항 배포
     * @param issue 이슈 설명
     * @param fixedFiles 수정된 파일 경로 목록
     * @param manualPath 매뉴얼 파일 경로
     */
    async deploy(issue, fixedFiles, manualPath) {
        if (!this.config.enabled) {
            console.log("🔄 GitHub 자동 배포가 비활성화되어 있습니다.");
            return {
                success: false,
                timestamp: Date.now(),
            };
        }
        try {
            console.log("🚀 GitHub 배포 시작...");
            const { stdout: statusOutput } = await execAsync("git status --porcelain");
            if (!statusOutput && fixedFiles.length === 0) {
                console.log("⚠️ 배포할 변경사항이 없습니다.");
                return {
                    success: false,
                    timestamp: Date.now(),
                };
            }
            for (const file of fixedFiles) {
                try {
                    await fs.access(file);
                    await execAsync(`git add "${file}"`);
                    console.log(`📂 파일 스테이징: ${file}`);
                }
                catch (error) {
                    console.error(`⚠️ 파일이 존재하지 않습니다: ${file}`);
                }
            }
            try {
                await fs.access(manualPath);
                await execAsync(`git add "${manualPath}"`);
                console.log(`📂 매뉴얼 파일 스테이징: ${manualPath}`);
            }
            catch (error) {
                console.error(`⚠️ 매뉴얼 파일이 존재하지 않습니다: ${manualPath}`);
            }
            const commitMessage = `${this.config.commitMessage}: ${issue}`;
            const { stdout: commitOutput } = await execAsync(`git commit -m "${commitMessage}"`);
            const commitHash = commitOutput.match(/\[.+\s+([a-f0-9]+)\]/)?.[1] || "";
            await execAsync(`git push origin ${this.config.branch}`);
            console.log(`✅ GitHub 배포 완료: ${commitHash}`);
            const result = {
                timestamp: Date.now(),
                success: true,
                commitHash,
            };
            this.deploymentHistory.push({
                ...result,
                issue,
            });
            return result;
        }
        catch (error) {
            console.error("❌ GitHub 배포 실패:", error);
            const result = {
                timestamp: Date.now(),
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
            this.deploymentHistory.push({
                ...result,
                issue,
            });
            return result;
        }
    }
    /**
     * 배포 활성화 상태 확인
     */
    isEnabled() {
        return this.config.enabled;
    }
    /**
     * 배포 설정 업데이트
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        console.log("📝 GitHub 배포 설정이 업데이트되었습니다.");
    }
    /**
     * 배포 활성화/비활성화 설정
     */
    setEnabled(enabled) {
        this.config.enabled = enabled;
        console.log(`🔄 GitHub 자동 배포: ${enabled ? "활성화" : "비활성화"}`);
    }
    /**
     * 배포 이력 가져오기
     */
    getDeploymentHistory() {
        return [...this.deploymentHistory];
    }
}
exports.GitHubDeployer = GitHubDeployer;
// 싱글톤 인스턴스 생성
exports.githubDeployer = new GitHubDeployer();
//# sourceMappingURL=github-deployer.js.map