import { TroubleshootingManager } from "./troubleshooting-manager";
import * as path from "path";
import * as fs from "fs/promises";

async function main() {
  try {
    // 대상 디렉토리 가져오기
    const targetDir = process.argv[2] || path.resolve(__dirname, "..");

    // 디렉토리 유효성 검사
    try {
      await fs.access(targetDir);
    } catch {
      console.error("❌ 대상 디렉토리를 찾을 수 없습니다:", targetDir);
      process.exit(1);
    }

    console.log("\n=== MCP 자동 트러블슈팅 가이드 생성기 ===");
    console.log("기능:");
    console.log("- 실시간 스크립트 분석");
    console.log("- 자동 매뉴얼 업데이트");
    console.log("- 에러 감지 및 처리");
    console.log("- 자동 복구 시도");
    console.log("=======================================\n");

    const manager = new TroubleshootingManager(targetDir);
    await manager.startWatching();

    // 종료 시그널 처리
    process.on("SIGINT", async () => {
      console.log("\n\n종료 신호 감지됨...");
      await manager.stopWatching();
      process.exit(0);
    });

    // 예기치 않은 종료 처리
    process.on("exit", async (code) => {
      if (code !== 0) {
        console.log("\n\n예기치 않은 종료 발생...");
        await manager.stopWatching();
      }
    });

    console.log("\n트러블슈팅 가이드 생성기가 실행 중입니다.");
    console.log("종료하려면 Ctrl+C를 누르세요...\n");
  } catch (error) {
    console.error("❌ 실행 중 오류 발생:", error);
    process.exit(1);
  }
}

main();
