import path from 'path';
import { generateManual } from '../../@manuals/scripts-main/manual-generator';

async function generateStyleGuide() {
  try {
    console.log('스타일 가이드 생성 시작...');

    // 현재 프로젝트 경로
    const projectPath = path.resolve(__dirname, '..');

    // 스타일 가이드 생성
    await generateManual(projectPath, {
      skipConfirmation: true,
      outputPath: path.join(projectPath, 'manuals'),
    });

    console.log('스타일 가이드 생성 완료!');
  } catch (error) {
    console.error('스타일 가이드 생성 중 오류 발생:', error);
    process.exit(1);
  }
}

generateStyleGuide();
