/**
 * GitHub 자동 배포 유틸리티
 * 이슈 수정 시 자동으로 GitHub에 배포하는 기능을 담당
 */

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";

const execAsync = promisify(exec);

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

export class GitHubDeployer {
  private config: GitHubConfig;
  private deploymentHistory: Array<{
    timestamp: number;
    issue: string;
    success: boolean;
    commitHash?: string;
    error?: string;
  }>;

  constructor(config?: Partial<GitHubConfig>) {
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
  public async deploy(
    issue: string,
    fixedFiles: string[],
    manualPath: string
  ): Promise<DeploymentResult> {
    if (!this.config.enabled) {
      console.log("🔄 GitHub 자동 배포가 비활성화되어 있습니다.");
      return {
        success: false,
        timestamp: Date.now(),
      };
    }

    try {
      console.log("🚀 GitHub 배포 시작...");

      const { stdout: statusOutput } = await execAsync(
        "git status --porcelain"
      );
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
        } catch (error) {
          console.error(`⚠️ 파일이 존재하지 않습니다: ${file}`);
        }
      }

      try {
        await fs.access(manualPath);
        await execAsync(`git add "${manualPath}"`);
        console.log(`📂 매뉴얼 파일 스테이징: ${manualPath}`);
      } catch (error) {
        console.error(`⚠️ 매뉴얼 파일이 존재하지 않습니다: ${manualPath}`);
      }

      const commitMessage = `${this.config.commitMessage}: ${issue}`;
      const { stdout: commitOutput } = await execAsync(
        `git commit -m "${commitMessage}"`
      );

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
    } catch (error) {
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
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * 배포 설정 업데이트
   */
  public updateConfig(config: Partial<GitHubConfig>): void {
    this.config = { ...this.config, ...config };
    console.log("📝 GitHub 배포 설정이 업데이트되었습니다.");
  }

  /**
   * 배포 활성화/비활성화 설정
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`🔄 GitHub 자동 배포: ${enabled ? "활성화" : "비활성화"}`);
  }

  /**
   * 배포 이력 가져오기
   */
  public getDeploymentHistory(): Array<{
    timestamp: number;
    issue: string;
    success: boolean;
    commitHash?: string;
    error?: string;
  }> {
    return [...this.deploymentHistory];
  }
}

// 싱글톤 인스턴스 생성
export const githubDeployer = new GitHubDeployer();
