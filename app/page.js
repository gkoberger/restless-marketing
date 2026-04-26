"use client";

import { useEffect, useRef, useState } from "react";

const CELL = 56;
const PAD_TOP = 80;
const PAD_SIDES = 80;
const PAD_BOTTOM = 80;
const CARD_COLS = 5;
const CARD_ROWS = 1;
const LOGO_COLS = 4;
const FADE_LEN = 60;
const GRID_TRANSPARENT = "rgba(229, 229, 229, 0)";
const GRID_COLOR = "#E5E5E5";
const DOT_COLOR = "#D0D0D0";
const DOT_RADIUS = 1.5;
const NUM_TRACES = 12;
const STEP_MS = 140;
const TRAIL_LENGTH = 5;
const TRAIL_COLOR = "#D4D4D4";

const PULSE_COLORS = ["#EF4444", "#22C55E", "#F59E0B"];
const CODES_BY_COLOR = {
  "#EF4444": ["500", "502", "503", "504"],
  "#F59E0B": ["400", "401", "403", "404"],
  "#22C55E": ["200", "201", "204"],
};
const PULSE_RADIUS = 3;
const PULSE_LIFETIME_MS = 12000;
const PULSE_FADE_IN_MS = 200;
const PULSE_FADE_OUT_MS = 600;
const PULSE_BREATH_MS = 1400;
const PULSE_BREATH_MIN = 0.8;
const PULSE_SPAWN_CHANCE = 0.1;

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function edgeKey(c1, r1, c2, r2) {
  return c1 < c2 || (c1 === c2 && r1 < r2)
    ? `${c1},${r1}-${c2},${r2}`
    : `${c2},${r2}-${c1},${r1}`;
}

function buildPath(start, cols, rows, isBlocked, initialDir = null) {
  const total = 8 + Math.floor(Math.random() * 4);
  const path = [{ ...start }];
  const edges = [];
  const localEdges = new Set();
  let current = { ...start };
  let lastDir = initialDir;

  for (let step = 0; step < total; step++) {
    const candidates = DIRS.filter((d) => {
      if (lastDir && d[0] === -lastDir[0] && d[1] === -lastDir[1]) return false;
      const nc = current.col + d[0];
      const nr = current.row + d[1];
      if (nc < 0 || nc > cols || nr < 0 || nr > rows) return false;
      const key = edgeKey(current.col, current.row, nc, nr);
      if (localEdges.has(key)) return false;
      if (isBlocked(key)) return false;
      return true;
    });
    if (candidates.length === 0) break;

    const sameDir =
      lastDir &&
      candidates.find((d) => d[0] === lastDir[0] && d[1] === lastDir[1]);
    const dir =
      sameDir && Math.random() < 0.7
        ? sameDir
        : candidates[Math.floor(Math.random() * candidates.length)];

    const nc = current.col + dir[0];
    const nr = current.row + dir[1];
    const key = edgeKey(current.col, current.row, nc, nr);
    localEdges.add(key);
    edges.push(key);
    current = { col: nc, row: nr };
    path.push({ ...current });
    lastDir = dir;
  }

  return { path, edges };
}

function randomCell(cols, rows) {
  return {
    col: Math.floor(Math.random() * (cols + 1)),
    row: Math.floor(Math.random() * (rows + 1)),
  };
}

function randomColor() {
  return PULSE_COLORS[Math.floor(Math.random() * PULSE_COLORS.length)];
}

const CMD_TEXT = "npx api-beta setup";

const COPY_GREEN = "#22C55E";
const COPY_STAGGER_MS = 55;

export default function Home() {
  const canvasBgRef = useRef(null);
  const canvasFgRef = useRef(null);
  const cardRef = useRef(null);
  const logoRef = useRef(null);
  const pulsesRef = useRef([]);
  const copiedAtRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [everCopied, setEverCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CMD_TEXT);
      setCopied(true);
      setEverCopied(true);
      setTimeout(() => setCopied(false), 1500);
      const now = performance.now();
      copiedAtRef.current = now;
      const list = pulsesRef.current.slice();
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      list.forEach((p, i) => {
        p.greenAt = now + i * COPY_STAGGER_MS;
      });
    } catch {}
  };

  useEffect(() => {
    const canvasBg = canvasBgRef.current;
    const canvasFg = canvasFgRef.current;
    const ctxBg = canvasBg.getContext("2d");
    const ctxFg = canvasFg.getContext("2d");
    let raf = 0;
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let offsetX = 0;
    let offsetY = 0;
    const traces = [];
    const pulses = pulsesRef.current;
    pulses.length = 0;
    const occupied = new Map();
    const cardEdges = new Set();
    const cardBounds = { col1: 0, row1: 0, col2: 0, row2: 0 };
    const cellMeta = new Map();
    const mouse = { x: -9999, y: -9999 };
    let hoverCell = null;

    const inCardInterior = (cell) =>
      cell.col > cardBounds.col1 &&
      cell.col < cardBounds.col2 &&
      cell.row > cardBounds.row1 &&
      cell.row < cardBounds.row2;

    const getCellMeta = (col, row) => {
      const key = `${col},${row}`;
      let m = cellMeta.get(key);
      if (!m) {
        const color =
          PULSE_COLORS[Math.floor(Math.random() * PULSE_COLORS.length)];
        const codes = CODES_BY_COLOR[color];
        const code = codes[Math.floor(Math.random() * codes.length)];
        const v = 249 + Math.floor(Math.random() * 4);
        const shade = `rgb(${v},${v},${v})`;
        m = { color, code, shade };
        cellMeta.set(key, m);
      }
      return m;
    };

    const addEdges = (edges) => {
      for (const e of edges) occupied.set(e, (occupied.get(e) || 0) + 1);
    };
    const removeEdges = (edges) => {
      for (const e of edges) {
        const n = (occupied.get(e) || 1) - 1;
        if (n <= 0) occupied.delete(e);
        else occupied.set(e, n);
      }
    };
    const isBlocked = (key) => occupied.has(key) || cardEdges.has(key);

    const spawnTrace = (now) => {
      let startCell = randomCell(cols, rows);
      for (let attempts = 0; attempts < 25 && inCardInterior(startCell); attempts++) {
        startCell = randomCell(cols, rows);
      }
      const { path, edges } = buildPath(startCell, cols, rows, isBlocked);
      if (path.length < 2) {
        return {
          path: null,
          edges: null,
          cell: startCell,
          start: now,
          lastCrossed: 0,
          startDelay: Math.random() * 4000,
        };
      }
      addEdges(edges);
      const duration = (path.length - 1) * STEP_MS;
      const startOffset = Math.random() * duration;
      return {
        path,
        edges,
        cell: path[0],
        start: now - startOffset,
        lastCrossed: Math.floor(startOffset / STEP_MS),
        startDelay: 0,
      };
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      for (const c of [canvasBg, canvasFg]) {
        c.width = Math.round(width * dpr);
        c.height = Math.round(height * dpr);
        c.style.width = width + "px";
        c.style.height = height + "px";
      }
      ctxBg.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxFg.setTransform(dpr, 0, 0, dpr, 0, 0);
      const availW = Math.max(CELL, width - PAD_SIDES * 2);
      const availH = Math.max(CELL, height - PAD_TOP - PAD_BOTTOM);
      cols = Math.floor(availW / CELL);
      rows = Math.floor(availH / CELL);
      offsetX = PAD_SIDES + (availW - cols * CELL) / 2;
      offsetY = PAD_TOP + (availH - rows * CELL) / 2;

      const cc = Math.min(CARD_COLS, cols);
      const cr = Math.min(CARD_ROWS, rows);
      cardBounds.col1 = Math.max(0, cols - cc - 1);
      cardBounds.row1 = Math.max(0, rows - cr - 1);
      cardBounds.col2 = cardBounds.col1 + cc;
      cardBounds.row2 = cardBounds.row1 + cr;

      cardEdges.clear();
      const blockBox = (col1, row1, col2, row2) => {
        for (let c = col1; c < col2; c++) {
          for (let r = row1; r <= row2; r++) {
            cardEdges.add(edgeKey(c, r, c + 1, r));
          }
        }
        for (let c = col1; c <= col2; c++) {
          for (let r = row1; r < row2; r++) {
            cardEdges.add(edgeKey(c, r, c, r + 1));
          }
        }
      };
      blockBox(
        cardBounds.col1,
        cardBounds.row1,
        cardBounds.col2,
        cardBounds.row2,
      );
      const lc = Math.min(LOGO_COLS, cols);
      const logoCol1 = Math.max(0, cardBounds.col1 - 1);
      const logoCol2 = Math.min(cols, logoCol1 + lc);
      const logoRow1 = Math.max(0, cardBounds.row1 - 1);
      const logoRow2 = cardBounds.row1;
      blockBox(logoCol1, logoRow1, logoCol2, logoRow2);

      const card = cardRef.current;
      if (card) {
        card.style.left = `${offsetX + cardBounds.col1 * CELL}px`;
        card.style.top = `${offsetY + cardBounds.row1 * CELL}px`;
        card.style.width = `${cc * CELL}px`;
        card.style.height = `${cr * CELL}px`;
        card.style.visibility = "visible";
      }

      const logo = logoRef.current;
      if (logo) {
        logo.style.left = `${offsetX + logoCol1 * CELL}px`;
        logo.style.top = `${offsetY + logoRow1 * CELL}px`;
        logo.style.width = `${(logoCol2 - logoCol1) * CELL}px`;
        logo.style.height = `${CELL}px`;
        logo.style.visibility = "visible";
      }
    };

    const cellX = (c) => offsetX + c * CELL;
    const cellY = (r) => offsetY + r * CELL;

    const drawFade = (x, y, dx, dy) => {
      const x2 = x + dx * FADE_LEN;
      const y2 = y + dy * FADE_LEN;
      const g = ctxBg.createLinearGradient(x, y, x2, y2);
      g.addColorStop(0, GRID_COLOR);
      g.addColorStop(1, GRID_TRANSPARENT);
      ctxBg.strokeStyle = g;
      ctxBg.beginPath();
      ctxBg.moveTo(x, y);
      ctxBg.lineTo(x2, y2);
      ctxBg.stroke();
    };

    const drawGrid = () => {
      ctxBg.strokeStyle = GRID_COLOR;
      ctxBg.lineWidth = 0.5;
      const radius = 5;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = cellX(c);
          const y = cellY(r);
          const tl = r > 0 && c > 0 ? radius : 0;
          const tr = r > 0 && c < cols - 1 ? radius : 0;
          const br = r < rows - 1 && c < cols - 1 ? radius : 0;
          const bl = r < rows - 1 && c > 0 ? radius : 0;
          ctxBg.beginPath();
          ctxBg.roundRect(x, y, CELL, CELL, [tl, tr, br, bl]);
          const isHover =
            hoverCell && hoverCell.col === c && hoverCell.row === r;
          ctxBg.fillStyle = isHover ? "#ffffff" : getCellMeta(c, r).shade;
          ctxBg.fill();
          ctxBg.stroke();
        }
      }

      const right = offsetX + cols * CELL;
      const bottom = offsetY + rows * CELL;
      drawFade(offsetX, offsetY, -1, 0);
      drawFade(offsetX, offsetY, 0, -1);
      drawFade(right, offsetY, 1, 0);
      drawFade(right, offsetY, 0, -1);
      drawFade(offsetX, bottom, -1, 0);
      drawFade(offsetX, bottom, 0, 1);
      drawFade(right, bottom, 1, 0);
      drawFade(right, bottom, 0, 1);
    };

    const spawnPulse = (cell, startTime) => {
      const meta = getCellMeta(cell.col, cell.row);
      let color = meta.color;
      let code = meta.code;
      if (copiedAtRef.current !== null) {
        color = COPY_GREEN;
        const codes = CODES_BY_COLOR[COPY_GREEN];
        code = codes[Math.floor(Math.random() * codes.length)];
      }
      pulses.push({
        cell: { ...cell },
        color,
        code,
        start: startTime,
      });
    };

    const drawTrace = (t, now) => {
      if (!t.path) {
        const { path, edges } = buildPath(
          t.cell,
          cols,
          rows,
          isBlocked,
          t.lastDir || null,
        );
        if (path.length < 2) {
          t.cell = randomCell(cols, rows);
          t.lastDir = null;
          return;
        }
        t.path = path;
        t.edges = edges;
        addEdges(edges);
        t.start = now;
        t.lastCrossed = 0;
      }

      const segCount = t.path.length - 1;
      const duration = segCount * STEP_MS;
      const elapsed = now - t.start;
      if (elapsed < 0) return;
      const atEnd = elapsed >= duration;
      const progress = atEnd ? segCount : (elapsed / duration) * segCount;
      const headSeg = atEnd ? segCount - 1 : Math.floor(progress);
      const segT = atEnd ? 1 : progress - headSeg;

      const crossed = atEnd ? segCount : Math.floor(progress);
      while (t.lastCrossed < crossed) {
        t.lastCrossed++;
        if (Math.random() < PULSE_SPAWN_CHANCE) {
          const pulseStart = t.start + t.lastCrossed * STEP_MS;
          spawnPulse(t.path[t.lastCrossed], pulseStart);
        }
      }

      ctxFg.save();
      ctxFg.lineCap = "round";
      ctxFg.lineWidth = 1.6;
      ctxFg.strokeStyle = TRAIL_COLOR;

      const headX =
        cellX(t.path[headSeg].col) +
        (cellX(t.path[headSeg + 1].col) - cellX(t.path[headSeg].col)) * segT;
      const headY =
        cellY(t.path[headSeg].row) +
        (cellY(t.path[headSeg + 1].row) - cellY(t.path[headSeg].row)) * segT;

      const tailProgress = Math.max(0, progress - TRAIL_LENGTH);
      const tailSeg = Math.floor(tailProgress);
      const tailT = tailProgress - tailSeg;

      const tailNext = t.path[tailSeg + 1] || t.path[tailSeg];
      const tailX =
        cellX(t.path[tailSeg].col) +
        (cellX(tailNext.col) - cellX(t.path[tailSeg].col)) * tailT;
      const tailY =
        cellY(t.path[tailSeg].row) +
        (cellY(tailNext.row) - cellY(t.path[tailSeg].row)) * tailT;

      const points = [{ x: tailX, y: tailY, alpha: 0 }];
      for (let i = tailSeg + 1; i <= headSeg; i++) {
        const local = i - tailProgress;
        const alpha = Math.min(1, local / TRAIL_LENGTH);
        points.push({
          x: cellX(t.path[i].col),
          y: cellY(t.path[i].row),
          alpha,
        });
      }
      points.push({ x: headX, y: headY, alpha: 1 });

      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        ctxFg.globalAlpha = (p0.alpha + p1.alpha) / 2;
        ctxFg.beginPath();
        ctxFg.moveTo(p0.x, p0.y);
        ctxFg.lineTo(p1.x, p1.y);
        ctxFg.stroke();
      }

      ctxFg.globalAlpha = 1;
      ctxFg.fillStyle = TRAIL_COLOR;
      ctxFg.beginPath();
      ctxFg.arc(headX, headY, 2.6, 0, Math.PI * 2);
      ctxFg.fill();
      ctxFg.restore();

      if (atEnd) {
        const last = t.path[t.path.length - 1];
        const prev = t.path[t.path.length - 2];
        t.lastDir = [last.col - prev.col, last.row - prev.row];
        t.cell = last;
        removeEdges(t.edges);
        t.path = null;
        t.edges = null;
      }
    };

    const drawPulses = (now) => {
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        const elapsed = now - p.start;
        if (elapsed < 0) continue;
        if (elapsed >= PULSE_LIFETIME_MS) {
          pulses.splice(i, 1);
          continue;
        }

        let edge;
        if (elapsed < PULSE_FADE_IN_MS) {
          edge = elapsed / PULSE_FADE_IN_MS;
        } else if (elapsed > PULSE_LIFETIME_MS - PULSE_FADE_OUT_MS) {
          edge = (PULSE_LIFETIME_MS - elapsed) / PULSE_FADE_OUT_MS;
        } else {
          edge = 1;
        }

        const phase = (elapsed / PULSE_BREATH_MS) * Math.PI * 2;
        const breath =
          PULSE_BREATH_MIN +
          (1 - PULSE_BREATH_MIN) * (0.5 + 0.5 * Math.sin(phase));
        const envelope = edge * breath;

        const color =
          p.greenAt !== undefined && now >= p.greenAt ? COPY_GREEN : p.color;

        const x = cellX(p.cell.col);
        const y = cellY(p.cell.row);
        ctxFg.save();
        ctxFg.globalAlpha = 0.12 * envelope;
        ctxFg.fillStyle = color;
        ctxFg.beginPath();
        ctxFg.arc(x, y, PULSE_RADIUS + envelope * 8, 0, Math.PI * 2);
        ctxFg.fill();

        ctxFg.globalAlpha = envelope;
        ctxFg.beginPath();
        ctxFg.arc(
          x,
          y,
          DOT_RADIUS + envelope * (PULSE_RADIUS - DOT_RADIUS),
          0,
          Math.PI * 2,
        );
        ctxFg.fill();
        ctxFg.restore();
      }
    };

    const drawHover = (now) => {
      if (mouse.x < 0) return;
      const col = Math.round((mouse.x - offsetX) / CELL);
      const row = Math.round((mouse.y - offsetY) / CELL);
      if (col < 0 || col > cols || row < 0 || row > rows) return;
      const x = cellX(col);
      const y = cellY(row);
      if (Math.hypot(x - mouse.x, y - mouse.y) > CELL * 0.45) return;

      const p = pulses.find(
        (q) => q.cell.col === col && q.cell.row === row,
      );
      if (!p) return;

      const color =
        p.greenAt !== undefined && now >= p.greenAt ? COPY_GREEN : p.color;

      ctxFg.save();
      ctxFg.font =
        '500 11px ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';
      ctxFg.textBaseline = "alphabetic";
      ctxFg.fillStyle = color;
      ctxFg.fillText(p.code, x + 9, y - 6);
      ctxFg.restore();
    };

    const draw = (now) => {
      if (mouse.x >= 0 && mouse.y >= 0) {
        const hc = Math.floor((mouse.x - offsetX) / CELL);
        const hr = Math.floor((mouse.y - offsetY) / CELL);
        hoverCell =
          hc >= 0 && hc < cols && hr >= 0 && hr < rows
            ? { col: hc, row: hr }
            : null;
      } else {
        hoverCell = null;
      }

      ctxBg.clearRect(0, 0, width, height);
      ctxFg.clearRect(0, 0, width, height);
      drawGrid();

      while (traces.length < NUM_TRACES) {
        traces.push(spawnTrace(now));
      }

      for (const t of traces) drawTrace(t, now);
      drawPulses(now);
      drawHover(now);

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    raf = requestAnimationFrame(draw);
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
      <canvas ref={canvasBgRef} className="grid-canvas" />
      <div ref={logoRef} className="site-logo">
        <img src="/restless.svg" alt="Restless" />
      </div>
      <div
        ref={cardRef}
        className={"info-card" + (everCopied ? " info-card-pinned" : "")}
      >
        <div className="info-cmd">
          <span className="info-cmd-prompt" aria-hidden="true">
            $
          </span>
          <span className="info-cmd-text">
            npx api<span className="info-cmd-beta" aria-hidden="true">-beta</span>{" "}
            setup
          </span>
        </div>
        <button
          type="button"
          className={"info-copy" + (copied ? " info-copy-done" : "")}
          onClick={handleCopy}
          aria-label="Copy command"
        >
          {copied ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
      <canvas ref={canvasFgRef} className="grid-canvas" />
    </>
  );
}
