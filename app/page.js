"use client";

import { useEffect, useRef } from "react";

const PALETTE = ["#2ecc71", "#f1c40f", "#e74c3c"];
const DOT_SPACING = 10;
const DOT_RADIUS = 1.2;
const DOT_GROW = 0.9;
const ELLIPSIS_RADIUS = 1.8;
const MOUSE_RADIUS = 80;
const MOUSE_ENABLED = true;
const BASE_COLOR = "#e6e6e6";
const BASE_RGB = [0xe6, 0xe6, 0xe6];
const AMBIENT_FRACTION = 0.03;
const AMBIENT_GROW = 1;
const AMBIENT_MIN_FRAMES = 70;
const AMBIENT_MAX_FRAMES = 170;
const AMBIENT_SPAWN_SMOOTHING = 25;
const PALETTE_RGB = PALETTE.map((h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
]);
const INSET_COLS = 6;
const INSET_ROWS = 6;

const blendToBase = (rgb, t) => {
  const r = Math.round(BASE_RGB[0] + (rgb[0] - BASE_RGB[0]) * t);
  const g = Math.round(BASE_RGB[1] + (rgb[1] - BASE_RGB[1]) * t);
  const b = Math.round(BASE_RGB[2] + (rgb[2] - BASE_RGB[2]) * t);
  return "rgb(" + r + "," + g + "," + b + ")";
};

export default function Home() {
  const canvasRef = useRef(null);
  const textRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const colorsRef = useRef(new Map());
  const geomRef = useRef(null);
  const activeRef = useRef(new Map());
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const textEl = textRef.current;
    const ctx = canvas.getContext("2d");
    let raf;

    const layout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cols = Math.floor(w / DOT_SPACING);
      const rows = Math.floor(h / DOT_SPACING);
      const offsetX = (w - (cols - 1) * DOT_SPACING) / 2;
      const offsetY = (h - (rows - 1) * DOT_SPACING) / 2;

      const row = rows - 1 - INSET_ROWS;
      const rowY = offsetY + row * DOT_SPACING;
      const startCol = INSET_COLS;
      const textLeft = offsetX + startCol * DOT_SPACING;

      const cs = getComputedStyle(textEl);
      const mc = document.createElement("canvas").getContext("2d");
      mc.font = cs.fontSize + " " + cs.fontFamily;
      const m = mc.measureText("Mg");
      const descent =
        m.actualBoundingBoxDescent || parseFloat(cs.fontSize) * 0.2;

      textEl.style.left = textLeft + "px";
      textEl.style.top = rowY + descent + "px";

      const rect = textEl.getBoundingClientRect();
      const textRightPx = textLeft + rect.width;

      let ellCol = startCol;
      for (let c = startCol; c < cols; c++) {
        const cx = offsetX + c * DOT_SPACING;
        if (cx >= textRightPx + DOT_SPACING * 0.6) {
          ellCol = c;
          break;
        }
      }

      const ellipsis = new Map();
      ellipsis.set(ellCol + "," + row, 0);
      ellipsis.set(ellCol + 1 + "," + row, 1);
      ellipsis.set(ellCol + 2 + "," + row, 2);

      geomRef.current = {
        w,
        h,
        cols,
        rows,
        offsetX,
        offsetY,
        ellipsis,
        textRect: {
          left: textLeft - 2,
          right: textLeft + rect.width + 2,
          top: rowY + descent - rect.height - 2,
          bottom: rowY + descent + 2,
        },
      };
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    };

    const paletteIdxFor = (i, j) => {
      const key = i + "," + j;
      let c = colorsRef.current.get(key);
      if (c === undefined) {
        c = Math.floor(Math.random() * PALETTE.length);
        colorsRef.current.set(key, c);
      }
      return c;
    };

    const inTextRect = (x, y, textRect) =>
      x >= textRect.left &&
      x <= textRect.right &&
      y >= textRect.top &&
      y <= textRect.bottom;

    const draw = () => {
      const g = geomRef.current;
      if (!g) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const { w, h, cols, rows, offsetX, offsetY, ellipsis, textRect } = g;
      ctx.clearRect(0, 0, w, h);

      const frame = ++frameRef.current;
      const active = activeRef.current;

      for (const [k, v] of active) {
        if (frame >= v.end) active.delete(k);
      }

      const totalCells = cols * rows;
      const target = Math.floor(totalCells * AMBIENT_FRACTION);
      const deficit = target - active.size;
      const spawnThisFrame = Math.max(
        0,
        Math.ceil(deficit / AMBIENT_SPAWN_SMOOTHING),
      );
      for (let k = 0; k < spawnThisFrame; k++) {
        const i = Math.floor(Math.random() * cols);
        const j = Math.floor(Math.random() * rows);
        const key = i + "," + j;
        if (active.has(key) || ellipsis.has(key)) continue;
        const x = offsetX + i * DOT_SPACING;
        const y = offsetY + j * DOT_SPACING;
        if (inTextRect(x, y, textRect)) continue;
        const duration =
          AMBIENT_MIN_FRAMES +
          Math.floor(Math.random() * (AMBIENT_MAX_FRAMES - AMBIENT_MIN_FRAMES));
        active.set(key, {
          start: frame,
          end: frame + duration,
          colorIdx: Math.floor(Math.random() * PALETTE.length),
        });
      }

      const { x: mx, y: my } = mouseRef.current;
      const r2 = MOUSE_RADIUS * MOUSE_RADIUS;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = offsetX + i * DOT_SPACING;
          const y = offsetY + j * DOT_SPACING;
          const key = i + "," + j;

          const ellIdx = ellipsis.get(key);
          if (ellIdx !== undefined) {
            ctx.fillStyle = PALETTE[ellIdx];
            ctx.beginPath();
            ctx.arc(x, y, ELLIPSIS_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            continue;
          }

          if (inTextRect(x, y, textRect)) continue;

          const dx = x - mx;
          const dy = y - my;
          const d2 = dx * dx + dy * dy;

          let radius = DOT_RADIUS;
          let fill = BASE_COLOR;

          if (MOUSE_ENABLED && d2 < r2) {
            const t = 1 - Math.sqrt(d2) / MOUSE_RADIUS;
            radius = DOT_RADIUS + t * DOT_GROW;
            fill = blendToBase(PALETTE_RGB[paletteIdxFor(i, j)], t);
          } else {
            const a = active.get(key);
            if (a) {
              const total = a.end - a.start;
              const age = frame - a.start;
              const half = total / 2;
              const tt = age < half ? age / half : (total - age) / half;
              radius = DOT_RADIUS + tt * AMBIENT_GROW;
              fill = blendToBase(PALETTE_RGB[a.colorIdx], tt);
            }
          }

          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="grid-canvas" />
      <div ref={textRef} className="coming-soon">
        coming soon
      </div>
    </>
  );
}
