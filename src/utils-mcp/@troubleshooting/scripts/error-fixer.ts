import * as fs from "fs";
import { exec } from "child_process";
import { ErrorCase } from "./error-types";

export class ErrorFixer {
  private fixers: Map<
    string,
    (filePath: string, match: RegExpMatchArray) => Promise<void>
  >;

  constructor() {
    this.fixers = new Map();
    this.initializeFixers();
  }

  private initializeFixers() {
    // 빌드 에러 수정
    this.fixers.set(
      "BE001",
      async (filePath: string, match: RegExpMatchArray) => {
        const content = fs.readFileSync(filePath, "utf8");
        const fixed = content.replace(
          /for\s*\(const\s*\[([^,\]]+),\s*([^\]]+)\]\s*of\s*Object\.entries\(([^)]+)\)\)/g,
          "Object.entries($3).forEach(([$1, $2]) =>"
        );
        fs.writeFileSync(filePath, fixed);
      }
    );

    // TypeScript 에러 수정
    this.fixers.set("TE001", async (filePath: string) => {
      await this.runCommand("npm run build");
    });

    // API 에러 수정
    this.fixers.set("AE001", async () => {
      await this.refreshApiToken();
    });
  }

  public async fixError(
    errorCase: ErrorCase,
    filePath: string,
    match: RegExpMatchArray
  ): Promise<boolean> {
    try {
      const fixer = this.fixers.get(errorCase.id);
      if (!fixer) {
        console.log(`❌ ${errorCase.id}에 대한 자동 수정 기능이 없습니다.`);
        return false;
      }

      await fixer(filePath, match);
      console.log(`✅ ${errorCase.id} 에러가 자동으로 수정되었습니다.`);
      return true;
    } catch (error) {
      console.error(`❌ ${errorCase.id} 에러 수정 중 실패:`, error);
      return false;
    }
  }

  private async runCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  }

  private async refreshApiToken(): Promise<void> {
    // API 토큰 갱신 로직 구현
    console.log("API 토큰 갱신 중...");
  }

  public registerFixer(
    errorId: string,
    fixer: (filePath: string, match: RegExpMatchArray) => Promise<void>
  ) {
    this.fixers.set(errorId, fixer);
    console.log(`✅ ${errorId}에 대한 자동 수정 기능이 등록되었습니다.`);
  }
}
