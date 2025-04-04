import * as fs from "fs/promises";
import * as path from "path";

interface ManualTemplate {
  title: string;
  sections: ManualSection[];
  lastUpdate: Date;
}

interface ManualSection {
  title: string;
  content: string;
  subsections?: ManualSection[];
}

export class ManualGenerator {
  private templatesDir: string;
  private manualsDir: string;

  constructor(rootDir: string) {
    this.templatesDir = path.join(rootDir, "..", "templates-manuals");
    this.manualsDir = path.join(rootDir, "manuals");
  }

  private async loadTemplate(templateName: string): Promise<ManualTemplate> {
    const templatePath = path.join(this.templatesDir, `${templateName}.json`);
    const content = await fs.readFile(templatePath, "utf-8");
    return JSON.parse(content);
  }

  private async saveManual(filename: string, content: string): Promise<void> {
    const manualPath = path.join(this.manualsDir, filename);
    await fs.writeFile(manualPath, content, "utf-8");
  }

  private generateMarkdown(template: ManualTemplate): string {
    let markdown = `# ${template.title}\n\n`;

    for (const section of template.sections) {
      markdown += this.generateSection(section, 2);
    }

    markdown += `\n---\n마지막 업데이트: ${template.lastUpdate.toLocaleString()}`;
    return markdown;
  }

  private generateSection(section: ManualSection, level: number): string {
    let markdown = `${"#".repeat(level)} ${section.title}\n\n${
      section.content
    }\n\n`;

    if (section.subsections) {
      for (const subsection of section.subsections) {
        markdown += this.generateSection(subsection, level + 1);
      }
    }

    return markdown;
  }

  public async generateManual(templateName: string): Promise<void> {
    try {
      const template = await this.loadTemplate(templateName);
      template.lastUpdate = new Date();

      const markdown = this.generateMarkdown(template);
      await this.saveManual(`${templateName}.md`, markdown);

      console.log(`매뉴얼 생성 완료: ${templateName}.md`);
    } catch (error) {
      console.error("매뉴얼 생성 오류:", error);
      throw error;
    }
  }

  public async updateManual(
    templateName: string,
    updates: Partial<ManualTemplate>
  ): Promise<void> {
    try {
      const template = await this.loadTemplate(templateName);

      // 템플릿 업데이트
      Object.assign(template, updates);
      template.lastUpdate = new Date();

      // 새로운 매뉴얼 생성
      const markdown = this.generateMarkdown(template);
      await this.saveManual(`${templateName}.md`, markdown);

      console.log(`매뉴얼 업데이트 완료: ${templateName}.md`);
    } catch (error) {
      console.error("매뉴얼 업데이트 오류:", error);
      throw error;
    }
  }
}
