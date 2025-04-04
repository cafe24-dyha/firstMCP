import winston from 'winston';
import path from 'path';
import fs from 'fs-extra';
import { LoggerOptions } from './types';

/**
 * logger.ts
 *
 * MCP 시스템 전용 로깅 모듈입니다.
 * Winston을 사용하여 파일 및 콘솔에 로그를 기록합니다.
 */

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

export default logger;
