"use strict";
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
function checkNodeVersion() {
    const version = process.version;
    const required = 'v14.0.0';
    if (version < required) {
        throw new Error(`Node.js 버전이 ${required} 이상이어야 합니다. 현재 버전: ${version}`);
    }
    console.log(`Node.js 버전 확인 완료: ${version}`);
}
function checkNpmVersion() {
    const version = execSync('npm --version').toString().trim();
    const required = '6.0.0';
    if (version < required) {
        throw new Error(`npm 버전이 ${required} 이상이어야 합니다. 현재 버전: ${version}`);
    }
    console.log(`npm 버전 확인 완료: ${version}`);
}
function checkTypeScriptVersion() {
    const version = execSync('npx tsc --version').toString().trim();
    const required = '5.0.0';
    if (version < required) {
        throw new Error(`TypeScript 버전이 ${required} 이상이어야 합니다. 현재 버전: ${version}`);
    }
    console.log(`TypeScript 버전 확인 완료: ${version}`);
}
function checkRequiredDirectories() {
    const dirs = ['templates', 'templates/lib', 'templates/backups', 'logs', 'backups'];
    dirs.forEach((dir) => {
        const dirPath = path.join(__dirname, '..', dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`디렉토리 생성 완료: ${dir}`);
        }
        else {
            console.log(`디렉토리 확인 완료: ${dir}`);
        }
    });
}
function main() {
    try {
        console.log('의존성 검증을 시작합니다...');
        checkNodeVersion();
        checkNpmVersion();
        checkTypeScriptVersion();
        checkRequiredDirectories();
        console.log('의존성 검증이 완료되었습니다.');
    }
    catch (error) {
        console.error('의존성 검증 중 오류가 발생했습니다:', error.message);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=preinstall.js.map