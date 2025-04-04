"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const setup_guide_updater_1 = require("./setup-guide-updater");
async function main() {
    try {
        const projectRoot = process.cwd();
        const updater = new setup_guide_updater_1.SetupGuideUpdater(projectRoot);
        await updater.updateGuide();
        console.log("✅ 가이드 업데이트 완료");
    }
    catch (error) {
        console.error("❌ 가이드 업데이트 실패:", error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=update-guide.js.map