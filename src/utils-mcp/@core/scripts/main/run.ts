import { AutomationRunner } from "./automation-runner";
import * as path from "path";

async function main() {
  try {
    const config = {
      rootDir: path.join(__dirname, "../../"),
      syncInterval: 5000,
      logLevel: "info" as const,
    };

    console.log("=== Utils-MCP 자동화 시스템 시작 ===");
    console.log(`실행 시간: ${new Date().toLocaleString()}`);
    console.log(`루트 디렉토리: ${config.rootDir}`);
    console.log("================================");

    const runner = new AutomationRunner(config);

    // 전체 검증 실행
    const isValid = await runner.validateAll();
    if (!isValid) {
      throw new Error("시스템 검증 실패");
    }

    // 자동화 시스템 시작
    await runner.start();

    console.log("=== 자동화 시스템 실행 중 ===");
    console.log("종료하려면 Ctrl+C를 누르세요.");
  } catch (error) {
    console.error("오류 발생:", error);
    process.exit(1);
  }
}

main().catch(console.error);
