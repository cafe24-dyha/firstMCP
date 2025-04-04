"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const net_1 = require("net");
// .env 파일 로드
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), 'src', '.env') });
const app = (0, express_1.default)();
const BASE_PORT = 3000;
// 사용 가능한 포트 찾기
async function findAvailablePort(startPort) {
    const isPortAvailable = (port) => {
        return new Promise((resolve) => {
            const server = (0, net_1.createServer)();
            server.once('error', () => resolve(false));
            server.once('listening', () => {
                server.close();
                resolve(true);
            });
            server.listen(port);
        });
    };
    for (let port = startPort; port < startPort + 100; port++) {
        if (await isPortAvailable(port)) {
            return port;
        }
    }
    throw new Error('No available ports found');
}
// JSON 파싱 미들웨어
app.use(express_1.default.json());
// 로깅 미들웨어
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
    });
    next();
});
// Figma API 클라이언트 설정
const figmaClient = axios_1.default.create({
    baseURL: 'https://api.figma.com/v1',
    headers: {
        'X-Figma-Token': process.env.FIGMA_ACCESS_TOKEN,
    },
});
// 상태 확인 엔드포인트
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});
// Figma 컴포넌트 가져오기
async function getFigmaComponents(fileId) {
    // 1. 먼저 파일의 컴포넌트 메타데이터만 가져옴
    const metaResponse = await figmaClient.get(`/files/${fileId}/components`);
    if (!metaResponse.data || !metaResponse.data.meta || !metaResponse.data.meta.components) {
        throw new Error('No components found in the file');
    }
    // 2. 컴포넌트 상세 정보 가져오기
    const componentIds = metaResponse.data.meta.components
        .map((component) => component.node_id)
        .join(',');
    const detailsResponse = await figmaClient.get(`/files/${fileId}/nodes?ids=${componentIds}`);
    return {
        meta: metaResponse.data.meta,
        details: detailsResponse.data,
    };
}
// 컴포넌트 정보 가져오기 엔드포인트
app.get('/api/figma/components', async (_req, res) => {
    try {
        const fileId = process.env.CDS_FILE_ID;
        if (!fileId) {
            throw new Error('CDS_FILE_ID is not set');
        }
        console.log('Fetching components from file:', fileId);
        const components = await getFigmaComponents(fileId);
        res.json({
            meta: {
                fileId,
                timestamp: new Date().toISOString(),
                apiVersion: components.meta.api_version || 'unknown',
                totalComponents: components.meta.components?.length || 0,
            },
            components: components.meta.components,
            details: components.details,
        });
    }
    catch (error) {
        console.error('Error:', error);
        const statusCode = axios_1.default.isAxiosError(error) && error.response ? error.response.status : 500;
        res.status(statusCode).json({
            error: 'Failed to fetch components',
            details: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
        });
    }
});
// 에러 핸들링
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
// 서버 시작
(async () => {
    try {
        const port = await findAvailablePort(BASE_PORT);
        const server = app.listen(port, () => {
            console.log(`서버가 포트 ${port}에서 실행중입니다`);
            console.log('환경 변수:');
            console.log('- FIGMA_ACCESS_TOKEN:', process.env.FIGMA_ACCESS_TOKEN?.slice(0, 10) + '...');
            console.log('- CDS_FILE_ID:', process.env.CDS_FILE_ID);
        });
        // 정상 종료 처리
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
})();
//# sourceMappingURL=server.js.map