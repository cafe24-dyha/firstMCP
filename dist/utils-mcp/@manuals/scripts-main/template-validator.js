"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateValidator = void 0;
const logger_1 = require("./logger");
class TemplateValidator {
    constructor(config) {
        this.logger = logger_1.Logger.getInstance();
        this.config = config;
    }
    validateTemplate(template, variables) {
        try {
            const missingKeys = this.validateRequiredKeys(variables);
            if (missingKeys.length > 0) {
                this.logger.error(`필수 키 누락: ${missingKeys.join(', ')}`);
                return false;
            }
            const typeErrors = this.validateTypes(variables);
            if (typeErrors.length > 0) {
                this.logger.error(`타입 검증 실패:\n${typeErrors.join('\n')}`);
                return false;
            }
            const templateErrors = this.validateTemplateVariables(template, variables);
            if (templateErrors.length > 0) {
                this.logger.error(`템플릿 변수 검증 실패:\n${templateErrors.join('\n')}`);
                return false;
            }
            this.logger.info('템플릿 검증 성공');
            return true;
        }
        catch (error) {
            if (error instanceof Error) {
                this.logger.error(`템플릿 검증 실패: ${error.message}`);
            }
            else {
                this.logger.error('템플릿 검증 실패: 알 수 없는 오류');
            }
            return false;
        }
    }
    validateRequiredKeys(variables) {
        return this.config.requiredKeys.filter((key) => {
            const value = this.getNestedValue(variables, key);
            return value === undefined || value === null || value === '';
        });
    }
    validateTypes(variables) {
        const errors = [];
        for (const [key, expectedType] of Object.entries(this.config.typeMap)) {
            const value = this.getNestedValue(variables, key);
            if (value !== undefined && !this.isValidType(value, expectedType)) {
                errors.push(`${key}: 예상 타입 ${expectedType}, 실제 타입 ${typeof value}`);
            }
        }
        return errors;
    }
    validateTemplateVariables(template, variables) {
        const errors = [];
        const variableRegex = /\{\{([^}]+)\}\}/g;
        let match;
        while ((match = variableRegex.exec(template)) !== null) {
            const variable = match[1].trim();
            const value = this.getNestedValue(variables, variable);
            if (value === undefined) {
                errors.push(`템플릿 변수 ${variable}에 대한 값이 없습니다.`);
            }
        }
        return errors;
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    isValidType(value, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            case 'number':
                return typeof value === 'number';
            case 'boolean':
                return typeof value === 'boolean';
            default:
                return true;
        }
    }
}
exports.TemplateValidator = TemplateValidator;
//# sourceMappingURL=template-validator.js.map