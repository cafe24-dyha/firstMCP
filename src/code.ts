/// <reference types="@figma/plugin-typings" />

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

interface UIMessage {
  type: "create-cds" | "update-components" | "export-styles";
  styles?: {
    colors: { name: string; paints: Paint[] }[];
    typography: { name: string; fontSize: number; fontName: FontName }[];
    effects: { name: string; effects: Effect[] }[];
  };
}

interface ErrorMessage {
  type: "error";
  message: string;
}

interface CDSComponentProperties {
  variant?: {
    type: "VARIANT_GROUP";
    options: string[];
  };
  size?: {
    type: "VARIANT_GROUP";
    options: string[];
  };
  state?: {
    type: "VARIANT_GROUP";
    options: string[];
  };
  type?: {
    type: "VARIANT_GROUP";
    options: string[];
  };
  hasIcon?: {
    type: "BOOLEAN";
    defaultValue: boolean;
  };
}

interface CDSComponentWithProperties extends ComponentNode {
  setProperties(properties: CDSComponentProperties): void;
}

// Figma 플러그인 메인 코드
figma.showUI(__html__, { width: 320, height: 400 });

// UI 이벤트 핸들러
figma.ui.onmessage = async (msg: UIMessage) => {
  // 작업 시작 전 현재 선택을 저장
  const currentSelection = figma.currentPage.selection;

  try {
    switch (msg.type) {
      case "create-cds":
        await createCDS();
        break;

      case "update-components":
        await updateComponents();
        break;

      case "export-styles":
        await exportStyles();
        break;

      default:
        console.error("Unknown message type:", msg.type);
    }
  } catch (error: unknown) {
    // 에러 발생 시 UI에 알림
    const errorMessage: ErrorMessage = {
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    };
    figma.ui.postMessage(errorMessage);
  }

  // 작업 완료 후 원래 선택 복원
  figma.currentPage.selection = currentSelection;
};

// CDS 생성 함수
async function createCDS() {
  // 스타일 시스템 생성
  const styleFrame = figma.createFrame();
  styleFrame.name = "CDS/Styles";
  styleFrame.resize(800, 600);

  // 컬러 스타일 생성
  const colors = {
    primary: { r: 0.2, g: 0.4, b: 0.9 },
    secondary: { r: 0.6, g: 0.2, b: 0.8 },
    success: { r: 0.2, g: 0.8, b: 0.4 },
    warning: { r: 1, g: 0.6, b: 0.1 },
    error: { r: 0.9, g: 0.2, b: 0.2 },
  };

  Object.entries(colors).forEach(([name, color]) => {
    const colorStyle = figma.createPaintStyle();
    colorStyle.name = `colors/${name}`;
    colorStyle.paints = [{ type: "SOLID", color }];
  });

  // 타이포그래피 스타일 생성
  const typography = {
    "heading/h1": { size: 48, weight: 700 },
    "heading/h2": { size: 36, weight: 700 },
    "heading/h3": { size: 24, weight: 600 },
    "body/large": { size: 18, weight: 400 },
    "body/medium": { size: 16, weight: 400 },
    "body/small": { size: 14, weight: 400 },
  };

  Object.entries(typography).forEach(([name, style]) => {
    const textStyle = figma.createTextStyle();
    textStyle.name = `typography/${name}`;
    textStyle.fontSize = style.size;
    textStyle.fontName = { family: "Inter", style: "Regular" };
  });

  figma.notify("CDS 생성 완료");
}

// 컴포넌트 업데이트 함수
async function updateComponents() {
  const nodes = figma.root.findAll((node) => node.type === "COMPONENT");
  const components = nodes.filter(
    (node): node is ComponentNode => node.type === "COMPONENT"
  );

  for (const component of components) {
    // 컴포넌트 이름이 CDS로 시작하는 경우에만 업데이트
    if (component.name.startsWith("CDS/")) {
      // 컴포넌트 속성 업데이트
      await updateComponentProperties(component);
    }
  }

  figma.notify("컴포넌트 업데이트 완료");
}

// 스타일 내보내기 함수
async function exportStyles() {
  const styles = {
    colors: await figma.getLocalPaintStylesAsync(),
    typography: await figma.getLocalTextStylesAsync(),
    effects: await figma.getLocalEffectStylesAsync(),
  };

  const styleData = {
    colors: styles.colors.map((style) => ({
      name: style.name,
      paints: style.paints,
    })),
    typography: styles.typography.map((style) => ({
      name: style.name,
      fontSize: style.fontSize,
      fontName: style.fontName,
    })),
    effects: styles.effects.map((style) => ({
      name: style.name,
      effects: style.effects,
    })),
  };

  // UI로 스타일 데이터 전송
  figma.ui.postMessage({
    type: "export-complete",
    styles: styleData,
  });

  figma.notify("스타일 내보내기 완료");
}

// 컴포넌트 속성 업데이트 함수
async function updateComponentProperties(component: ComponentNode) {
  // 컴포넌트 타입에 따른 속성 업데이트
  if (component.name.includes("Button")) {
    updateButtonProperties(component);
  } else if (component.name.includes("Input")) {
    updateInputProperties(component);
  }
}

// 버튼 컴포넌트 속성 업데이트
function updateButtonProperties(component: ComponentNode) {
  // 버튼 변형 속성 설정
  if ("setProperties" in component) {
    (component as CDSComponentWithProperties).setProperties({
      variant: {
        type: "VARIANT_GROUP",
        options: ["primary", "secondary", "outline"],
      },
      size: {
        type: "VARIANT_GROUP",
        options: ["small", "medium", "large"],
      },
      state: {
        type: "VARIANT_GROUP",
        options: ["default", "hover", "pressed", "disabled"],
      },
    });
  }
}

// 입력 필드 컴포넌트 속성 업데이트
function updateInputProperties(component: ComponentNode) {
  // 입력 필드 변형 속성 설정
  if ("setProperties" in component) {
    (component as CDSComponentWithProperties).setProperties({
      type: {
        type: "VARIANT_GROUP",
        options: ["text", "number", "password"],
      },
      state: {
        type: "VARIANT_GROUP",
        options: ["default", "focus", "error", "disabled"],
      },
      hasIcon: {
        type: "BOOLEAN",
        defaultValue: false,
      },
    });
  }
}

// Runs this code if the plugin is run in Figma
if (figma.editorType === "figma") {
  // This plugin creates rectangles on the screen.
  const numberOfRectangles = 5;

  const nodes: SceneNode[] = [];
  for (let i = 0; i < numberOfRectangles; i++) {
    const rect = figma.createRectangle();
    rect.x = i * 150;
    rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
    figma.currentPage.appendChild(rect);
    nodes.push(rect);
  }
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
}

// Runs this code if the plugin is run in FigJam
if (figma.editorType === "figjam") {
  // This plugin creates shapes and connectors on the screen.
  const numberOfShapes = 5;

  const nodes: SceneNode[] = [];
  for (let i = 0; i < numberOfShapes; i++) {
    const shape = figma.createShapeWithText();
    // You can set shapeType to one of: 'SQUARE' | 'ELLIPSE' | 'ROUNDED_RECTANGLE' | 'DIAMOND' | 'TRIANGLE_UP' | 'TRIANGLE_DOWN' | 'PARALLELOGRAM_RIGHT' | 'PARALLELOGRAM_LEFT'
    shape.shapeType = "ROUNDED_RECTANGLE";
    shape.x = i * (shape.width + 200);
    shape.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
    figma.currentPage.appendChild(shape);
    nodes.push(shape);
  }

  for (let i = 0; i < numberOfShapes - 1; i++) {
    const connector = figma.createConnector();
    connector.strokeWeight = 8;

    connector.connectorStart = {
      endpointNodeId: nodes[i].id,
      magnet: "AUTO",
    };

    connector.connectorEnd = {
      endpointNodeId: nodes[i + 1].id,
      magnet: "AUTO",
    };
  }

  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
}

// Runs this code if the plugin is run in Slides
if (figma.editorType === "slides") {
  // This plugin creates slides and puts the user in grid view.
  const numberOfSlides = 5;

  const nodes: SlideNode[] = [];
  for (let i = 0; i < numberOfSlides; i++) {
    const slide = figma.createSlide();
    nodes.push(slide);
  }

  figma.viewport.slidesView = "grid";
  figma.currentPage.selection = nodes;

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
}
