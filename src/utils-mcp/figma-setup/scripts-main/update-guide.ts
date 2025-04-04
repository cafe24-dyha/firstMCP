import { SetupGuideUpdater } from "./setup-guide-updater";

async function main() {
  try {
    const projectRoot = process.cwd();
    const updater = new SetupGuideUpdater(projectRoot);
    await updater.updateGuide();
    console.log("✅ 가이드 업데이트 완료");
  } catch (error) {
    console.error("❌ 가이드 업데이트 실패:", error);
    process.exit(1);
  }
}

main();
