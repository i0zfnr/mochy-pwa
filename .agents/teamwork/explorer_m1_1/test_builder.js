import fs from 'node:fs';
import { execSync } from 'node:child_process';

class FigCraftBuilder {
  constructor() {
    this.commands = [];
    this.nextId = 2; // Root Page is ID 1; first created frame is ID 2
  }

  createFrame({ name, width, height, x = 0, y = 0, fills, fill, layout, gap, padding, mainAlign, crossAlign }) {
    const id = this.nextId++;
    const props = {};
    if (fills) props.fills = fills;
    if (fill) props.fill = fill;
    if (layout) props.layout = layout;
    if (gap !== undefined) props.gap = gap;
    if (padding !== undefined) props.padding = padding;
    if (mainAlign) props.mainAlign = mainAlign;
    if (crossAlign) props.crossAlign = crossAlign;

    this.commands.push({
      command: 'frame.create',
      params: { name, width, height, x, y, props }
    });
    return id;
  }

  createContainer({ parent, name, width, height, x = 0, y = 0, fill, cornerRadius, stroke, strokeWeight, effects, layout, gap, padding, mainAlign, crossAlign }) {
    const id = this.nextId++;
    const props = {};
    if (fill) props.fill = fill;
    if (cornerRadius !== undefined) props.cornerRadius = cornerRadius;
    if (stroke) props.stroke = stroke;
    if (strokeWeight !== undefined) props.strokeWeight = strokeWeight;
    if (effects) props.effects = effects;
    if (layout) props.layout = layout;
    if (gap !== undefined) props.gap = gap;
    if (padding !== undefined) props.padding = padding;
    if (mainAlign) props.mainAlign = mainAlign;
    if (crossAlign) props.crossAlign = crossAlign;

    this.commands.push({
      command: 'node.create',
      params: {
        parent,
        type: 'frame',
        name,
        width,
        height,
        x,
        y,
        props
      }
    });
    return id;
  }

  createText({ parent, text, fontSize = 14, fontFamily = 'Inter', fontStyle = 'Regular', fill = '#FFFFFF', x = 0, y = 0, width }) {
    const id = this.nextId++;
    const props = { fontSize, fontFamily, fontStyle, fill };
    const params = {
      parent,
      type: 'text',
      name: text.substring(0, 24),
      text,
      x,
      y,
      props
    };
    if (width !== undefined) params.width = width;
    this.commands.push({ command: 'node.create', params });
    return id;
  }

  createVector({ parent, name, path, width = 24, height = 24, fill = 'none', stroke = '#FFFFFF', strokeWeight = 2, x = 0, y = 0 }) {
    const id = this.nextId++;
    this.commands.push({
      command: 'node.create',
      params: {
        parent,
        type: 'vector',
        name,
        width,
        height,
        x,
        y,
        path,
        props: { fill, stroke, strokeWeight }
      }
    });
    return id;
  }

  placeImage({ target, path }) {
    this.commands.push({
      command: 'image.place',
      params: { target, path }
    });
  }

  toJSON() {
    return JSON.stringify(this.commands, null, 2);
  }
}

// Test build
const b = new FigCraftBuilder();
const artboard = b.createFrame({
  name: 'Builder Pattern Test',
  width: 800,
  height: 500,
  fill: '#0A0D14'
});

const platter = b.createContainer({
  parent: artboard,
  name: 'Glass Platter',
  width: 400,
  height: 60,
  x: 200,
  y: 80,
  fill: '#FFFFFF14',
  cornerRadius: 16,
  stroke: '#FFFFFF33',
  strokeWeight: 1,
  effects: [
    { type: 'backgroundBlur', radius: 24 },
    { type: 'innerShadow', color: '#FFFFFF4D', offset: [0, 1], radius: 2 },
    { type: 'dropShadow', color: '#00000066', offset: [0, 10], radius: 24, spread: 0 }
  ],
  layout: 'horizontal',
  gap: 12,
  padding: [12, 20, 12, 20],
  crossAlign: 'center'
});

b.createVector({
  parent: platter,
  name: 'PlayIcon',
  path: 'M5 3l14 9-14 9V3z',
  width: 20,
  height: 20,
  fill: '#FA586A',
  stroke: 'none'
});

b.createText({
  parent: platter,
  text: 'Builder Pattern Verified',
  fontSize: 16,
  fontFamily: 'Inter',
  fontStyle: 'SemiBold',
  fill: '#FFFFFF'
});

fs.writeFileSync('c:/laragon/www/mochy-pwa/.agents/teamwork/explorer_m1_1/test_builder.json', b.toJSON(), 'utf8');
console.log('Successfully wrote test_builder.json');
