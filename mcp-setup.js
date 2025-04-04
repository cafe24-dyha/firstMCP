const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

// 필요한 패키지 설치
const packages = [
  "@figma/plugin-typings",
  "@types/node",
  "esbuild",
  "typescript",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/parser",
  "eslint",
  "react",
  "@types/react",
  "react-dom",
  "@types/react-dom",
];

async function setupFigmaPlugin() {
  console.log("🚀 Figma 플러그인 개발 환경 설정을 시작합니다...");

  // 디렉토리 구조 생성
  const directories = ["src", "src/components", "src/ui", "src/utils", "build"];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 ${dir} 디렉토리를 생성했습니다.`);
    }
  });

  // 패키지 설치
  console.log("📦 필요한 패키지를 설치합니다...");
  execSync(`npm install --save-dev ${packages.join(" ")}`, {
    stdio: "inherit",
  });

  // UI 컴포넌트 템플릿 생성
  const uiTemplate = `import * as React from 'react';
import '../styles/ui.css';

export function App() {
  return (
    <div className="container">
      <h2>CDS Maker</h2>
      <div className="button-container">
        <button onClick={() => parent.postMessage({ pluginMessage: { type: 'create-cds' }}, '*')}>
          Create CDS
        </button>
        <button onClick={() => parent.postMessage({ pluginMessage: { type: 'update-components' }}, '*')}>
          Update Components
        </button>
        <button onClick={() => parent.postMessage({ pluginMessage: { type: 'export-styles' }}, '*')}>
          Export Styles
        </button>
      </div>
    </div>
  );
}`;

  fs.writeFileSync("src/ui/App.tsx", uiTemplate);

  // 스타일 파일 생성
  const cssTemplate = `
.container {
  padding: 16px;
}

.button-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background-color: #18A0FB;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #0D8DE3;
}`;

  fs.writeFileSync("src/styles/ui.css", cssTemplate);

  // esbuild 설정 파일 생성
  const esbuildConfig = `const esbuild = require('esbuild');

// Plugin UI 빌드
esbuild.build({
  entryPoints: ['src/ui/index.tsx'],
  bundle: true,
  outfile: 'build/ui.js',
  minify: true,
  sourcemap: true,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
}).catch(() => process.exit(1));

// Plugin 코드 빌드
esbuild.build({
  entryPoints: ['src/code.ts'],
  bundle: true,
  outfile: 'build/code.js',
  minify: true,
  sourcemap: true,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
}).catch(() => process.exit(1));`;

  fs.writeFileSync("esbuild.config.js", esbuildConfig);

  // package.json 스크립트 업데이트
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  packageJson.scripts = {
    ...packageJson.scripts,
    build: "node esbuild.config.js",
    watch: "node esbuild.config.js --watch",
    dev: "npm run watch",
  };
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));

  console.log("✅ 개발 환경 설정이 완료되었습니다!");
  console.log("📘 다음 명령어로 개발을 시작하세요:");
  console.log("   npm run dev    # 개발 모드 시작");
  console.log("   npm run build  # 프로덕션 빌드");
}

setupFigmaPlugin().catch(console.error);
