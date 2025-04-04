import * as fs from "fs";
import * as path from "path";
import { ErrorCase } from "../types/error-types";

export class ErrorHandler {
  private docsPath: string;
  private templatesPath: string;

  constructor() {
    // 프로젝트 루트 기준 경로 설정
    this.docsPath = path.join(__dirname, "../../docs/auto-generated");
    this.templatesPath = path.join(__dirname, "../../docs/templates");
    this.initializeDocs();
  }

  private initializeDocs() {
    const categories = ["plugin", "api", "ui", "build"];
    categories.forEach((category) => {
      const categoryPath = path.join(this.docsPath, "categories", category);
      if (!fs.existsSync(categoryPath)) {
        fs.mkdirSync(categoryPath, { recursive: true });
      }
    });
  }

  // ... 나머지 코드는 그대로 유지
}
