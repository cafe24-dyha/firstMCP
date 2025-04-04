"use strict";(()=>{figma.showUI(__html__,{width:320,height:400});figma.ui.onmessage=async t=>{let n=figma.currentPage.selection;try{switch(t.type){case"create-cds":await i();break;case"update-components":await r();break;case"export-styles":await c();break;default:console.error("Unknown message type:",t.type)}}catch(e){let o={type:"error",message:e instanceof Error?e.message:String(e)};figma.ui.postMessage(o)}figma.currentPage.selection=n};async function i(){let t=figma.createFrame();t.name="CDS/Styles",t.resize(800,600),Object.entries({primary:{r:.2,g:.4,b:.9},secondary:{r:.6,g:.2,b:.8},success:{r:.2,g:.8,b:.4},warning:{r:1,g:.6,b:.1},error:{r:.9,g:.2,b:.2}}).forEach(([o,a])=>{let s=figma.createPaintStyle();s.name=`colors/${o}`,s.paints=[{type:"SOLID",color:a}]}),Object.entries({"heading/h1":{size:48,weight:700},"heading/h2":{size:36,weight:700},"heading/h3":{size:24,weight:600},"body/large":{size:18,weight:400},"body/medium":{size:16,weight:400},"body/small":{size:14,weight:400}}).forEach(([o,a])=>{let s=figma.createTextStyle();s.name=`typography/${o}`,s.fontSize=a.size,s.fontName={family:"Inter",style:"Regular"}}),figma.notify("CDS \uC0DD\uC131 \uC644\uB8CC")}async function r(){let n=figma.root.findAll(e=>e.type==="COMPONENT").filter(e=>e.type==="COMPONENT");for(let e of n)e.name.startsWith("CDS/")&&await p(e);figma.notify("\uCEF4\uD3EC\uB10C\uD2B8 \uC5C5\uB370\uC774\uD2B8 \uC644\uB8CC")}async function c(){let t={colors:await figma.getLocalPaintStylesAsync(),typography:await figma.getLocalTextStylesAsync(),effects:await figma.getLocalEffectStylesAsync()},n={colors:t.colors.map(e=>({name:e.name,paints:e.paints})),typography:t.typography.map(e=>({name:e.name,fontSize:e.fontSize,fontName:e.fontName})),effects:t.effects.map(e=>({name:e.name,effects:e.effects}))};figma.ui.postMessage({type:"export-complete",styles:n}),figma.notify("\uC2A4\uD0C0\uC77C \uB0B4\uBCF4\uB0B4\uAE30 \uC644\uB8CC")}async function p(t){t.name.includes("Button")?f(t):t.name.includes("Input")&&g(t)}function f(t){"setProperties"in t&&t.setProperties({variant:{type:"VARIANT_GROUP",options:["primary","secondary","outline"]},size:{type:"VARIANT_GROUP",options:["small","medium","large"]},state:{type:"VARIANT_GROUP",options:["default","hover","pressed","disabled"]}})}function g(t){"setProperties"in t&&t.setProperties({type:{type:"VARIANT_GROUP",options:["text","number","password"]},state:{type:"VARIANT_GROUP",options:["default","focus","error","disabled"]},hasIcon:{type:"BOOLEAN",defaultValue:!1}})}if(figma.editorType==="figma"){let n=[];for(let e=0;e<5;e++){let o=figma.createRectangle();o.x=e*150,o.fills=[{type:"SOLID",color:{r:1,g:.5,b:0}}],figma.currentPage.appendChild(o),n.push(o)}figma.currentPage.selection=n,figma.viewport.scrollAndZoomIntoView(n),figma.closePlugin()}if(figma.editorType==="figjam"){let n=[];for(let e=0;e<5;e++){let o=figma.createShapeWithText();o.shapeType="ROUNDED_RECTANGLE",o.x=e*(o.width+200),o.fills=[{type:"SOLID",color:{r:1,g:.5,b:0}}],figma.currentPage.appendChild(o),n.push(o)}for(let e=0;e<4;e++){let o=figma.createConnector();o.strokeWeight=8,o.connectorStart={endpointNodeId:n[e].id,magnet:"AUTO"},o.connectorEnd={endpointNodeId:n[e+1].id,magnet:"AUTO"}}figma.currentPage.selection=n,figma.viewport.scrollAndZoomIntoView(n),figma.closePlugin()}if(figma.editorType==="slides"){let n=[];for(let e=0;e<5;e++){let o=figma.createSlide();n.push(o)}figma.viewport.slidesView="grid",figma.currentPage.selection=n,figma.closePlugin()}})();
//# sourceMappingURL=code.js.map
