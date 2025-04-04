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
exports.Locker = void 0;
const fs = __importStar(require("fs"));
const logger_1 = require("./logger");
class Locker {
    constructor(lockFile) {
        this.lockFile = lockFile;
        this.logger = logger_1.Logger.getInstance();
    }
    lock() {
        try {
            if (fs.existsSync(this.lockFile)) {
                const lockTime = fs.readFileSync(this.lockFile, 'utf-8');
                const lockDate = new Date(parseInt(lockTime));
                const now = new Date();
                const diffMinutes = (now.getTime() - lockDate.getTime()) / (1000 * 60);
                if (diffMinutes > 30) {
                    this.logger.warn(`오래된 락 파일 발견 (${diffMinutes}분). 락을 해제합니다.`);
                    this.unlock();
                    return this.lock();
                }
                this.logger.warn(`다른 프로세스가 실행 중입니다. (락 생성: ${lockDate.toISOString()})`);
                return false;
            }
            fs.writeFileSync(this.lockFile, Date.now().toString(), { flag: 'wx' });
            this.logger.info('락 획득 성공');
            return true;
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`락 획득 실패: ${error.message}`);
            }
            else {
                this.logger.error('락 획득 실패: 알 수 없는 오류');
            }
            return false;
        }
    }
    unlock() {
        try {
            if (fs.existsSync(this.lockFile)) {
                fs.unlinkSync(this.lockFile);
                this.logger.info('락 해제 완료');
            }
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`락 해제 실패: ${error.message}`);
            }
            else {
                this.logger.error('락 해제 실패: 알 수 없는 오류');
            }
        }
    }
    isLocked() {
        return fs.existsSync(this.lockFile);
    }
    getLockInfo() {
        if (!this.isLocked()) {
            return { locked: false };
        }
        try {
            const lockTime = fs.readFileSync(this.lockFile, 'utf-8');
            return {
                locked: true,
                lockTime: new Date(parseInt(lockTime)),
            };
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`락 정보 조회 실패: ${error.message}`);
            }
            else {
                this.logger.error('락 정보 조회 실패: 알 수 없는 오류');
            }
            return { locked: false };
        }
    }
}
exports.Locker = Locker;
//# sourceMappingURL=locker.js.map