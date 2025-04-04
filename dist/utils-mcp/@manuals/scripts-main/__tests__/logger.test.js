"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const logger_1 = require("../logger");
describe('Logger', () => {
    let logger;
    let logFile;
    let logDir;
    beforeEach(() => {
        logDir = path.join(process.cwd(), 'logs');
        logFile = path.join(logDir, 'manual-generator.log');
        logger_1.Logger.reset();
        logger = logger_1.Logger.getInstance();
        if (fs.existsSync(logDir)) {
            fs.rmSync(logDir, { recursive: true, force: true });
        }
        fs.mkdirSync(logDir, { recursive: true });
    });
    afterEach(() => {
        logger_1.Logger.reset();
        if (fs.existsSync(logFile)) {
            fs.unlinkSync(logFile);
        }
        if (fs.existsSync(logDir)) {
            fs.rmSync(logDir, { recursive: true, force: true });
        }
    });
    describe('로그 기록', () => {
        it('error 레벨 로그를 기록해야 합니다', () => {
            logger.error('테스트 에러');
            const logs = logger.getLogs();
            expect(logs.length).toBe(1);
            expect(logs[0].level).toBe('error');
            expect(logs[0].message).toBe('테스트 에러');
            expect(fs.existsSync(logFile)).toBe(true);
        });
        it('warn 레벨 로그를 기록해야 합니다', () => {
            logger.warn('테스트 경고');
            const logs = logger.getLogs();
            expect(logs.length).toBe(1);
            expect(logs[0].level).toBe('warn');
            expect(logs[0].message).toBe('테스트 경고');
            expect(fs.existsSync(logFile)).toBe(true);
        });
        it('info 레벨 로그를 기록해야 합니다', () => {
            logger.info('테스트 정보');
            const logs = logger.getLogs();
            expect(logs.length).toBe(1);
            expect(logs[0].level).toBe('info');
            expect(logs[0].message).toBe('테스트 정보');
            expect(fs.existsSync(logFile)).toBe(true);
        });
        it('debug 레벨 로그를 기록해야 합니다', () => {
            logger.debug('테스트 디버그');
            const logs = logger.getLogs();
            expect(logs.length).toBe(1);
            expect(logs[0].level).toBe('debug');
            expect(logs[0].message).toBe('테스트 디버그');
            expect(fs.existsSync(logFile)).toBe(true);
        });
        it('상세 정보와 함께 로그를 기록해야 합니다', () => {
            const details = { key: 'value' };
            logger.info('테스트 메시지', details);
            const logs = logger.getLogs();
            expect(logs.length).toBe(1);
            expect(logs[0].details).toEqual(details);
            expect(fs.existsSync(logFile)).toBe(true);
        });
        it('로그 레벨에 따라 필터링되어야 합니다', () => {
            logger.setLogLevel('warn');
            logger.debug('디버그 메시지');
            logger.info('정보 메시지');
            logger.warn('경고 메시지');
            logger.error('에러 메시지');
            const logs = logger.getLogs();
            expect(logs.length).toBe(2);
            expect(logs[0].level).toBe('warn');
            expect(logs[1].level).toBe('error');
        });
    });
    describe('로그 파일 관리', () => {
        it('로그 파일이 생성되어야 합니다', () => {
            logger.info('테스트 메시지');
            expect(fs.existsSync(logFile)).toBe(true);
        });
        it('로그 파일 크기 제한을 설정할 수 있어야 합니다', () => {
            logger.setMaxLogSize(10);
            logger.info('테스트 메시지');
            logger.info('테스트 메시지');
            logger.info('테스트 메시지');
            expect(fs.existsSync(path.join(logDir, 'manual-generator.1.log'))).toBe(true);
        });
        it('최대 로그 파일 수를 설정할 수 있어야 합니다', () => {
            logger.setMaxLogFiles(3);
            logger.setMaxLogSize(10);
            for (let i = 0; i < 5; i++) {
                logger.info('테스트 메시지');
            }
            const logFiles = fs.readdirSync(logDir);
            expect(logFiles.length).toBeLessThanOrEqual(4);
        });
    });
    describe('로그 관리', () => {
        it('여러 로그를 순서대로 기록해야 합니다', () => {
            logger.info('첫 번째 메시지');
            logger.info('두 번째 메시지');
            logger.info('세 번째 메시지');
            const logs = logger.getLogs();
            expect(logs.length).toBe(3);
            expect(logs[0].message).toBe('첫 번째 메시지');
            expect(logs[1].message).toBe('두 번째 메시지');
            expect(logs[2].message).toBe('세 번째 메시지');
        });
        it('로그를 정리할 수 있어야 합니다', () => {
            logger.info('테스트 메시지');
            expect(logger.getLogs().length).toBe(1);
            logger.clearLogs();
            expect(logger.getLogs().length).toBe(0);
            expect(fs.existsSync(logFile)).toBe(true);
        });
    });
    describe('싱글톤 패턴', () => {
        it('동일한 인스턴스를 반환해야 합니다', () => {
            const logger1 = logger_1.Logger.getInstance();
            const logger2 = logger_1.Logger.getInstance();
            expect(logger1).toBe(logger2);
        });
        it('로그가 인스턴스 간에 공유되어야 합니다', () => {
            const logger1 = logger_1.Logger.getInstance();
            const logger2 = logger_1.Logger.getInstance();
            logger1.info('테스트 메시지');
            expect(logger2.getLogs().length).toBe(1);
            expect(logger2.getLogs()[0].message).toBe('테스트 메시지');
        });
    });
});
//# sourceMappingURL=logger.test.js.map