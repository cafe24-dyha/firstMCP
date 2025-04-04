const esbuild = require("esbuild");
const path = require("path");

async function build() {
  try {
    // Plugin UI 빌드
    await esbuild.build({
      entryPoints: ["src/ui/index.tsx"],
      bundle: true,
      outfile: "build/ui.js",
      minify: true,
      sourcemap: true,
      target: ["es2017"],
      loader: {
        ".tsx": "tsx",
        ".ts": "ts",
        ".css": "css",
      },
      resolveExtensions: [".ts", ".tsx", ".js", ".jsx"],
      absWorkingDir: process.cwd(),
      tsconfig: "tsconfig.json",
    });

    // Plugin 코드 빌드
    await esbuild.build({
      entryPoints: ["src/code.ts"],
      bundle: true,
      outfile: "build/code.js",
      minify: true,
      sourcemap: true,
      target: ["es2017"],
      loader: {
        ".ts": "ts",
      },
      resolveExtensions: [".ts", ".js"],
      absWorkingDir: process.cwd(),
      tsconfig: "tsconfig.json",
    });

    console.log("✅ 빌드 성공!");
  } catch (error) {
    console.error("❌ 빌드 실패:", error);
    process.exit(1);
  }
}

// Watch 모드
if (process.argv.includes("--watch")) {
  console.log("👀 Watch 모드 시작...");
  build();
  require("chokidar")
    .watch("src/**/*.{ts,tsx,css}", {
      ignored: /(^|[\/\\])\../,
    })
    .on("change", (path) => {
      console.log(`🔄 파일 변경 감지: ${path}`);
      build();
    });
} else {
  build();
}
