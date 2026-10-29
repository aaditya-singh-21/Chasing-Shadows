export type Paint = string | CanvasGradient | CanvasPattern;

/** Small Canvas illustration helpers, used only while creating textures. */
export class Painter {
  readonly ctx: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  rect(
    x: number,
    y: number,
    w: number,
    h: number,
    fill: Paint | null,
    stroke: string | null = null,
  ) {
    const c = this.ctx;
    if (fill) {
      c.fillStyle = fill;
      c.fillRect(x, y, w, h);
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = 1;
      c.strokeRect(x + 0.5, y + 0.5, w, h);
    }
  }
  path(
    points: readonly (readonly [number, number])[],
    fill: Paint | null,
    stroke: string | null = null,
    line = 1,
  ) {
    const c = this.ctx;
    c.beginPath();
    for (let i = 0; i < points.length; i++) i ? c.lineTo(...points[i]!) : c.moveTo(...points[i]!);
    if (fill) {
      c.closePath();
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = line;
      c.stroke();
    }
  }
  line(x: number, y: number, xx: number, yy: number, colour: string, width = 1) {
    this.path(
      [
        [x, y],
        [xx, yy],
      ],
      null,
      colour,
      width,
    );
  }
  ellipse(
    x: number,
    y: number,
    rx: number,
    ry: number,
    fill: Paint | null,
    stroke: string | null = null,
  ) {
    const c = this.ctx;
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    if (fill) {
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.stroke();
    }
  }
  round(
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number | number[],
    fill: Paint | null,
    stroke: string | null = null,
  ) {
    const c = this.ctx;
    c.beginPath();
    c.roundRect(x, y, w, h, radius);
    if (fill) {
      c.fillStyle = fill;
      c.fill();
    }
    if (stroke) {
      c.strokeStyle = stroke;
      c.lineWidth = 1;
      c.stroke();
    }
  }
  text(
    text: string,
    x: number,
    y: number,
    size: number,
    fill: string,
    font = 'Georgia',
    align: CanvasTextAlign = 'left',
  ) {
    const c = this.ctx;
    c.fillStyle = fill;
    c.font = `${size}px ${font}`;
    c.textAlign = align;
    c.fillText(text, x, y);
  }
  glow(x: number, y: number, radius: number, colour = '226,190,120', strength = 0.2) {
    const c = this.ctx,
      gradient = c.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${colour},${strength})`);
    gradient.addColorStop(0.3, `rgba(${colour},${strength * 0.35})`);
    gradient.addColorStop(1, `rgba(${colour},0)`);
    this.rect(x - radius, y - radius, radius * 2, radius * 2, gradient);
  }
}
