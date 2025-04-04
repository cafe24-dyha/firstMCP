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
exports.CacheManager = void 0;
const fs = __importStar(require("fs"));
class CacheManager {
    constructor() {
        this.defaultTTL = 5 * 60 * 1000;
        this.cache = new Map();
    }
    static getInstance() {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }
    set(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl,
        });
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        if (this.isExpired(entry)) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }
    delete(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    setDefaultTTL(ttl) {
        this.defaultTTL = ttl;
    }
    isExpired(entry) {
        return Date.now() - entry.timestamp > entry.ttl;
    }
    async loadFromFile(key, filePath) {
        try {
            const stats = await fs.promises.stat(filePath);
            const entry = this.cache.get(key);
            if (entry && !this.isExpired(entry)) {
                return entry.value;
            }
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const value = JSON.parse(content);
            this.set(key, value);
            return value;
        }
        catch (error) {
            console.error(`캐시 로드 실패 (${key}):`, error);
            return null;
        }
    }
    async saveToFile(key, filePath) {
        try {
            const entry = this.cache.get(key);
            if (!entry) {
                return;
            }
            const content = JSON.stringify(entry.value, null, 2);
            await fs.promises.writeFile(filePath, content, 'utf-8');
        }
        catch (error) {
            console.error(`캐시 저장 실패 (${key}):`, error);
        }
    }
    getCacheSize() {
        return this.cache.size;
    }
    getCacheKeys() {
        return Array.from(this.cache.keys());
    }
}
exports.CacheManager = CacheManager;
//# sourceMappingURL=cache-manager.js.map