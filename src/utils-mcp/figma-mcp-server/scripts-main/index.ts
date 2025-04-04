import express from 'express';
import { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import axios, { AxiosError } from 'axios';
import { createServer } from 'net';

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = parseInt(process.env.PORT || '3004', 10);
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;
const FIGMA_NODE_ID = process.env.FIGMA_NODE_ID;

if (!FIGMA_ACCESS_TOKEN || !FIGMA_FILE_ID) {
  console.error('Missing required environment variables:');
  if (!FIGMA_ACCESS_TOKEN) console.error('- FIGMA_ACCESS_TOKEN');
  if (!FIGMA_FILE_ID) console.error('- FIGMA_FILE_ID');
  process.exit(1);
}

// Figma API 타입 정의
interface FigmaPage {
  id: string;
  name: string;
  type: string;
}

interface FigmaComponent {
  id: string;
  name: string;
  type: string;
  children?: FigmaComponent[];
}

interface FigmaComponentSet extends FigmaComponent {
  componentPropertyDefinitions?: Record<
    string,
    {
      type: string;
      defaultValue: any;
    }
  >;
}

interface FigmaFile {
  name: string;
  lastModified: string;
  document: {
    children: FigmaPage[];
  };
}

// Figma API 기본 설정
const figmaApi = axios.create({
  baseURL: 'https://api.figma.com/v1',
  headers: {
    'X-Figma-Token': FIGMA_ACCESS_TOKEN,
  },
});

// 사용 가능한 포트 찾기
async function findAvailablePort(startPort: number): Promise<number> {
  const isPortAvailable = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const server = createServer();
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
app.use(express.json());

// 로깅 미들웨어
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`
    );
  });
  next();
});

// 상태 확인 엔드포인트
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    config: {
      fileId: FIGMA_FILE_ID,
      hasToken: !!FIGMA_ACCESS_TOKEN,
    },
    timestamp: new Date().toISOString(),
  });
});

// Figma 파일 정보 조회
app.get('/api/figma/components', async (req: Request, res: Response) => {
  try {
    // 파일 메타데이터만 조회 (페이지 목록)
    const fileResponse = await figmaApi.get<FigmaFile>(`/files/${FIGMA_FILE_ID}`, {
      params: {
        depth: 1,
        geometry: 'paths',
      },
    });

    // 페이지 목록 추출
    const pages = fileResponse.data.document.children
      .filter((page) => page.type === 'CANVAS')
      .map((page: FigmaPage) => ({
        id: page.id,
        name: page.name,
        type: page.type,
      }));

    // 🚫dev 페이지 찾기
    const devPage = pages.find((page) => page.name === '🚫dev');

    if (!devPage) {
      return res.status(404).json({
        error: 'Dev page not found',
        pages: pages.map((p) => p.name),
      });
    }

    // 특정 페이지의 컴포넌트만 조회 (더 자세한 정보 포함)
    const pageResponse = await figmaApi.get(`/files/${FIGMA_FILE_ID}/nodes?ids=${devPage.id}`, {
      params: {
        depth: 2, // 컴포넌트셋 내부 정보까지 가져오기
      },
    });

    // button-dev 컴포넌트셋 찾기
    const pageNode = pageResponse.data.nodes[devPage.id];
    let buttonDevSet: FigmaComponentSet | null = null;

    if (pageNode && pageNode.document.children) {
      buttonDevSet =
        pageNode.document.children.find(
          (child: FigmaComponentSet) =>
            child.type === 'COMPONENT_SET' && child.name === 'button-dev'
        ) || null;
    }

    if (!buttonDevSet) {
      return res.status(404).json({
        error: 'Button dev component set not found',
        availableComponents: pageNode?.document.children
          .filter((child: FigmaComponent) => child.type === 'COMPONENT_SET')
          .map((comp: FigmaComponent) => comp.name),
      });
    }

    // 응답 데이터 구성
    const result = {
      file: {
        name: fileResponse.data.name,
        lastModified: fileResponse.data.lastModified,
      },
      page: {
        id: devPage.id,
        name: devPage.name,
      },
      componentSet: {
        id: buttonDevSet.id,
        name: buttonDevSet.name,
        type: buttonDevSet.type,
        properties: buttonDevSet.componentPropertyDefinitions,
        variants: buttonDevSet.children?.map((variant) => ({
          id: variant.id,
          name: variant.name,
          type: variant.type,
        })),
      },
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching Figma file:', error);

    const axiosError = error as AxiosError<{ status: number; err: string }>;
    const errorDetails = {
      message: axiosError.message,
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
    };

    res.status(axiosError.response?.status || 500).json({
      error: 'Failed to fetch Figma file',
      details: errorDetails,
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
    const port = await findAvailablePort(PORT);
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Figma file ID: ${FIGMA_FILE_ID}`);
      console.log(`Figma token status: ${FIGMA_ACCESS_TOKEN ? 'Set' : 'Not set'}`);
    });

    // 정상 종료 처리
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
