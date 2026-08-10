/**
 * Layout maths for the off/beat template generator.
 *
 * The six templates are structural reductions of the published off/beat social
 * work, not inventions. Reading that work back:
 *
 * - Most posts carry **no stepped shape at all** (Shark Tank, Raj Sharma,
 *   AI Duplicates, Breaking & Building). The cut belongs to two archetypes:
 *   the Venture Capital type plates and the Godmode subject frame.
 * - The ground is usually paper lilac, olive, or a gradient. Signal pink is
 *   one option among several, not the default.
 * - The header mark is the bracketed lockup, never a filled plate.
 * - Huge type running over the image is the signature move.
 *
 * Every measurement descends from φ: splits fall on the 61.8 / 38.2 line,
 * margins are the minor axis × 0.0618, and the type scale steps by φ.
 */
import { steppedRectPath } from "./steppedShape";

export const PHI = 1.618033988749895;
export const PHI_INV = 0.618033988749895;

/** Minimum rendered width for the bracket lockup; below this use the compact signature mark. */
export const LOCKUP_MIN_WIDTH = 96;

export type RatioKey = "1:1" | "9:16" | "16:9";

export const RATIOS: Record<RatioKey, { width: number; height: number; use: string }> = {
  "1:1": { width: 1080, height: 1080, use: "Feed post" },
  "9:16": { width: 1080, height: 1920, use: "Story / reel" },
  "16:9": { width: 1920, height: 1080, use: "Presentation / banner" },
};

export type TemplateKey = "event" | "plates" | "guide" | "announcement" | "overlap" | "report";

export const TEMPLATES: Record<TemplateKey, { name: string; note: string; shape: boolean }> = {
  event: { name: "Event", note: "Lockup, framed subject, headline, meta row", shape: true },
  plates: { name: "Type plates", note: "Centred headline on stepped plates", shape: true },
  guide: { name: "Guide cover", note: "Full-bleed image, headline on the golden line", shape: false },
  announcement: { name: "Announcement", note: "Subject bleed, headline, role", shape: false },
  overlap: { name: "Type over image", note: "Headline running across the subject", shape: false },
  report: { name: "Report", note: "Corner annotations, object, headline", shape: false },
};

export type Colourway = {
  name: string;
  ground: string;
  /** When set, the ground is a vertical gradient from `ground` to `to`. */
  to?: string;
  ink: string;
  accent: string;
  accentInk: string;
};

export const COLOURWAYS: Colourway[] = [
  { name: "Paper lilac", ground: "#D1CDD2", ink: "#3D0A1E", accent: "#FF00B4", accentInk: "#FFFFFF" },
  { name: "Grey to olive", ground: "#C9C9C9", to: "#A8A400", ink: "#000000", accent: "#A8A400", accentInk: "#000000" },
  { name: "Cream to pink", ground: "#FFF3E0", to: "#FF3DA6", ink: "#4A0E28", accent: "#FF00B4", accentInk: "#FFFFFF" },
  { name: "Signal pink", ground: "#FF00B4", ink: "#000000", accent: "#000000", accentInk: "#FF00B4" },
  { name: "White to red", ground: "#FFFFFF", to: "#B23A2E", ink: "#FFFFFF", accent: "#B23A2E", accentInk: "#FFFFFF" },
  { name: "Ink", ground: "#000000", ink: "#FFFFFF", accent: "#FF00B4", accentInk: "#000000" },
];

export type TemplateCopy = {
  eyebrow: string;
  headline: string;
  subhead: string;
  metaA: string;
  metaB: string;
  metaC: string;
};

export const PLACEHOLDER_COPY: TemplateCopy = {
  eyebrow: "PRESENTS",
  headline: "HEADLINE GOES HERE",
  subhead: "One supporting line, sentence case, kept short.",
  metaA: "BRAND LAUNCH",
  metaB: "HORIZON ONE",
  metaC: "3RD MARCH",
};

export type TemplateOptions = {
  ratio: RatioKey;
  template: TemplateKey;
  colourway: Colourway;
  copy: TemplateCopy;
  /** Stepped corner cuts; 0 keeps corners square. Ignored where shape is false. */
  steps: number;
  cut: number;
  guides: boolean;
};

const DISPLAY_FONT = "Archivo, 'Arial Narrow', Helvetica, Arial, sans-serif";
const VOICE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
export const DISPLAY_WIDTH_FACTOR = 0.52;

function esc(value: string) {
  return value.replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;",
    };
    return entities[character];
  });
}

export function metrics(ratio: RatioKey) {
  const { width, height } = RATIOS[ratio];
  const minor = Math.min(width, height);
  const margin = minor * 0.0618;
  const base = minor * 0.026;

  return {
    width,
    height,
    minor,
    margin,
    content: width - margin * 2,
    goldenY: height * PHI_INV,
    goldenX: width * PHI_INV,
    scale: {
      micro: base * 0.62,
      meta: base * 0.78,
      body: base,
      subhead: base * PHI,
      display: base * Math.pow(PHI, ratio === "16:9" ? 2.3 : 2.7),
    },
  };
}

function text(
  x: number,
  y: number,
  value: string,
  size: number,
  fill: string,
  options: { font?: string; weight?: number; anchor?: string; tracking?: number; upper?: boolean } = {},
) {
  if (!value) return "";
  const content = options.upper ? value.toUpperCase() : value;
  const font = options.font ?? VOICE_FONT;
  const weight = options.weight ?? 500;
  const anchor = options.anchor ?? "start";
  const tracking = options.tracking ?? 0;
  // Archivo is variable: social headlines use the narrow width axis.
  const variation =
    font === DISPLAY_FONT ? ` style="font-variation-settings:&apos;wdth&apos; 62,&apos;wght&apos; ${weight}"` : "";

  return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" fill="${fill}" font-family="${font}" font-size="${size.toFixed(2)}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${tracking.toFixed(3)}" dominant-baseline="middle"${variation}>${esc(content)}</text>`;
}

function wrapToLines(value: string, maxLines: number) {
  const words = value.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  if (maxLines <= 1) return [words.join(" ")];

  const target = Math.ceil(words.join(" ").length / maxLines);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && candidate.length > target && lines.length < maxLines - 1) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Fit a headline to a box. SVG cannot measure text and the layout must stay
 * deterministic on the server, so glyph width is approximated: Archivo at
 * wdth 62, bold uppercase, averages ~0.50em per character. The estimate runs
 * slightly generous so type lands inside the margin rather than on it.
 */
function fitText(
  value: string,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
  widthFactor = DISPLAY_WIDTH_FACTOR,
  lineHeight = 1.02,
) {
  let best = { lines: [value], size: 0 };

  for (let count = 1; count <= 6; count += 1) {
    const lines = wrapToLines(value, count);
    if (lines.length !== count && count > 1) continue;
    const longest = lines.reduce((max, line) => Math.max(max, line.length), 1);
    const size = Math.min(maxSize, maxWidth / (longest * widthFactor), maxHeight / (count * lineHeight));
    if (size > best.size) best = { lines, size };
  }

  return best;
}

/** Vertical gradient ground, or a flat fill. */
function ground(m: ReturnType<typeof metrics>, c: Colourway) {
  if (!c.to) return `<rect width="${m.width}" height="${m.height}" fill="${c.ground}"/>`;
  return (
    `<defs><linearGradient id="tg-ground" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${c.ground}"/><stop offset="1" stop-color="${c.to}"/></linearGradient></defs>` +
    `<rect width="${m.width}" height="${m.height}" fill="url(#tg-ground)"/>`
  );
}

/** One stepped bracket, drawn from the mark's own geometry. */
function bracket(x: number, y: number, w: number, h: number, fill: string, flip = false) {
  const path =
    `M0 0 L${w} 0 L${w} ${h * 0.16} L${w * 0.52} ${h * 0.16} L${w * 0.52} ${h * 0.34} ` +
    `L${w * 0.26} ${h * 0.34} L${w * 0.26} ${h * 0.66} L${w * 0.52} ${h * 0.66} ` +
    `L${w * 0.52} ${h * 0.84} L${w} ${h * 0.84} L${w} ${h} L0 ${h} Z`;
  const transform = flip
    ? `translate(${(x + w).toFixed(2)} ${y.toFixed(2)}) scale(-1 1)`
    : `translate(${x.toFixed(2)} ${y.toFixed(2)})`;
  return `<g transform="${transform}"><path d="${path}" fill="${fill}"/></g>`;
}

/** The stepped slash signature mark. It is an icon, not the alternate logo. */
function slashMark(cx: number, cy: number, size: number, c: Colourway) {
  const x = cx - size / 2;
  const y = cy - size / 2;
  const s = size;
  return (
    `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">` +
    `<path d="${steppedRectPath(s, s, 0.22, 2)}" fill="${c.accent}"/>` +
    `<path d="M${s * 0.62} ${s * 0.2} L${s * 0.76} ${s * 0.2} L${s * 0.4} ${s * 0.8} L${s * 0.26} ${s * 0.8} Z" fill="${c.accentInk}"/>` +
    `</g>`
  );
}

/**
 * The header lockup. Below the minimum rendered width the bracket lockup loses
 * its steps, so use the compact signature mark rather than a shrunken lockup.
 */
function headerMark(cx: number, cy: number, width: number, c: Colourway) {
  if (width < LOCKUP_MIN_WIDTH) return slashMark(cx, cy, LOCKUP_MIN_WIDTH * 0.5, c);

  const h = width * 0.22;
  const bw = width * 0.11;
  const x = cx - width / 2;
  const y = cy - h / 2;

  return (
    bracket(x, y, bw, h, c.accent) +
    bracket(x + width - bw, y, bw, h, c.accent, true) +
    text(cx, cy, "OFF/BEAT", h * 0.62, c.accent, { anchor: "middle", weight: 800, tracking: -h * 0.012 })
  );
}

/** Placeholder image well: tinted field, cross, and label. */
function imageWell(
  x: number, y: number, w: number, h: number, o: TemplateOptions, label = "IMAGE", stepped = false,
) {
  const c = o.colourway;
  const line = Math.max(1.5, Math.min(w, h) * 0.006);
  const use = stepped && o.steps > 0;
  const outline = use
    ? `<path transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" d="${steppedRectPath(w, h, o.cut, o.steps)}"`
    : `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}"`;
  const clipId = `w${Math.round(x)}-${Math.round(y)}-${Math.round(w)}`;

  return (
    `${outline} fill="${c.ink}" opacity="0.18"/>` +
    `<defs><clipPath id="${clipId}">${outline} /></clipPath></defs>` +
    `<g clip-path="url(#${clipId})"><path d="M${x.toFixed(2)} ${y.toFixed(2)} L${(x + w).toFixed(2)} ${(y + h).toFixed(2)} M${(x + w).toFixed(2)} ${y.toFixed(2)} L${x.toFixed(2)} ${(y + h).toFixed(2)}" stroke="${c.ink}" stroke-width="${line}" opacity="0.3"/></g>` +
    `${outline} fill="none" stroke="${c.ink}" stroke-width="${line}" opacity="0.45"/>` +
    text(x + w / 2, y + h / 2, label, Math.max(11, Math.min(w, h) * 0.05), c.ink, {
      anchor: "middle", weight: 700, tracking: Math.min(w, h) * 0.005, upper: true,
    })
  );
}

/** Two-line corner annotation, as used across the report and event work. */
function annotation(x: number, y: number, line1: string, line2: string, size: number, c: Colourway, end = false) {
  const anchor = end ? "end" : "start";
  return (
    text(x, y, line1, size, c.ink, { anchor, weight: 700, tracking: size * 0.06, upper: true }) +
    text(x, y + size * 1.25, line2, size, c.ink, { anchor, weight: 700, tracking: size * 0.06, upper: true })
  );
}

function goldenGuides(m: ReturnType<typeof metrics>) {
  const s = `stroke="#00E5FF" stroke-width="${Math.max(1, m.minor * 0.0015)}" stroke-dasharray="${m.minor * 0.012} ${m.minor * 0.008}" opacity="0.85"`;
  return (
    `<line x1="0" y1="${m.goldenY.toFixed(2)}" x2="${m.width}" y2="${m.goldenY.toFixed(2)}" ${s}/>` +
    `<line x1="0" y1="${(m.height - m.goldenY).toFixed(2)}" x2="${m.width}" y2="${(m.height - m.goldenY).toFixed(2)}" ${s}/>` +
    `<line x1="${m.goldenX.toFixed(2)}" y1="0" x2="${m.goldenX.toFixed(2)}" y2="${m.height}" ${s}/>` +
    `<rect x="${m.margin.toFixed(2)}" y="${m.margin.toFixed(2)}" width="${(m.width - m.margin * 2).toFixed(2)}" height="${(m.height - m.margin * 2).toFixed(2)}" fill="none" ${s}/>`
  );
}

/* -------------------------------------------------------------------------
   Templates
   ------------------------------------------------------------------------- */

/** Godmode: lockup, PRESENTS, framed subject, headline, three-column footer. */
function buildEvent(o: TemplateOptions) {
  const m = metrics(o.ratio);
  const c = o.colourway;
  const lockupW = Math.min(m.content * 0.4, m.width * 0.34);
  const lockupY = m.margin + lockupW * 0.13;
  const eyebrowY = lockupY + lockupW * 0.2;
  const footerY = m.height - m.margin - m.scale.meta * 0.6;
  const subY = footerY - m.scale.meta * 2.6;

  const head = fitText(o.copy.headline, m.content, m.height * 0.2, m.scale.display);
  const headBlock = head.lines.length * head.size * 1.02;
  const headTop = subY - m.scale.meta * 1.8 - headBlock;

  const wellTop = eyebrowY + m.scale.meta * 2;
  const wellH = Math.max(headTop - m.margin * 0.5 - wellTop, m.minor * 0.2);
  const wellW = Math.min(m.content, wellH * 1.1);

  return (
    headerMark(m.width / 2, lockupY, lockupW, c) +
    text(m.width / 2, eyebrowY, o.copy.eyebrow, m.scale.meta, c.ink, {
      anchor: "middle", weight: 700, tracking: m.scale.meta * 0.16, upper: true,
    }) +
    imageWell((m.width - wellW) / 2, wellTop, wellW, wellH, o, "SUBJECT", true) +
    head.lines.map((line, i) =>
      text(m.width / 2, headTop + head.size * 0.6 + i * head.size * 1.02, line, head.size, c.ink, {
        anchor: "middle", font: DISPLAY_FONT, weight: 800, tracking: -head.size * 0.015, upper: true,
      })).join("") +
    text(m.width / 2, subY, o.copy.subhead, m.scale.meta, c.ink, { anchor: "middle", weight: 500 }) +
    text(m.margin, footerY, o.copy.metaA, m.scale.meta, c.ink, { weight: 700, tracking: m.scale.meta * 0.1, upper: true }) +
    text(m.width / 2, footerY, o.copy.metaB, m.scale.meta, c.ink, { anchor: "middle", weight: 700, tracking: m.scale.meta * 0.1, upper: true }) +
    text(m.width - m.margin, footerY, o.copy.metaC, m.scale.meta, c.ink, { anchor: "end", weight: 700, tracking: m.scale.meta * 0.1, upper: true })
  );
}

/** Venture Capital: headline set on stepped plates, side meta on the golden line. */
function buildPlates(o: TemplateOptions) {
  const m = metrics(o.ratio);
  const c = o.colourway;
  // This layout always uses black headline type. When a colourway's accent is
  // black, move the plate to the approved pale ground so the type stays clear.
  const plateFill = c.accent.toUpperCase() === "#000000" ? "#D1CDD2" : c.accent;
  const top = m.margin + m.scale.micro * 2;
  const bottom = m.height - m.margin - m.scale.meta * 2.4;
  const inset = m.content * 0.04;
  const head = fitText(o.copy.headline, m.content - inset * 2, bottom - top, m.width * 0.16);
  const lineH = head.size * 1.2;
  const blockTop = top + (bottom - top - lineH * head.lines.length) / 2;

  const stack = head.lines.map((line, i) => {
    const y = blockTop + i * lineH;
    const w = Math.min(m.content, line.length * head.size * (DISPLAY_WIDTH_FACTOR + 0.06) + inset * 2);
    const x = (m.width - w) / 2;
    return (
      `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><path d="${steppedRectPath(w, lineH * 0.9, o.cut, Math.max(o.steps, 1))}" fill="${plateFill}"/></g>` +
      text(x + w / 2, y + lineH * 0.45, line, head.size, "#000000", {
        anchor: "middle", font: DISPLAY_FONT, weight: 800, tracking: -head.size * 0.02, upper: true,
      })
    );
  }).join("");

  // Meta remains in the corners so the centred plate stack stays unobstructed.
  return (
    text(m.margin, m.margin + m.scale.micro, o.copy.metaA, m.scale.micro, c.ink, {
      weight: 700, tracking: m.scale.micro * 0.12, upper: true,
    }) +
    text(m.width - m.margin, m.margin + m.scale.micro, o.copy.metaB, m.scale.micro, c.ink, {
      anchor: "end", weight: 700, tracking: m.scale.micro * 0.12, upper: true,
    }) +
    stack +
    text(m.width / 2, m.height - m.margin, o.copy.metaC, m.scale.meta, c.ink, {
      anchor: "middle", weight: 700, tracking: m.scale.meta * 0.14, upper: true,
    })
  );
}

/** Shark Tank: full-bleed image, wash, eyebrow and headline on the lower zone. */
function buildGuide(o: TemplateOptions) {
  const m = metrics(o.ratio);
  const c = o.colourway;
  const head = fitText(o.copy.headline, m.content, (m.height - m.goldenY) * 0.6, m.scale.display * 0.82);
  const blockH = head.lines.length * head.size * 1.02;
  const headTop = m.height - m.margin - blockH;

  return (
    imageWell(0, 0, m.width, m.height, o, "FULL BLEED IMAGE") +
    `<defs><linearGradient id="tg-wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.to ?? c.ground}" stop-opacity="0"/><stop offset="0.55" stop-color="${c.to ?? c.ground}" stop-opacity="0.9"/></linearGradient></defs>` +
    `<rect x="0" y="${(m.goldenY * 0.6).toFixed(2)}" width="${m.width}" height="${(m.height - m.goldenY * 0.6).toFixed(2)}" fill="url(#tg-wash)"/>` +
    text(m.margin, headTop - m.scale.meta * 1.8, o.copy.eyebrow, m.scale.meta, c.ink, {
      weight: 700, tracking: m.scale.meta * 0.18, upper: true,
    }) +
    head.lines.map((line, i) =>
      text(m.margin, headTop + head.size * 0.6 + i * head.size * 1.02, line, head.size, c.ink, {
        font: DISPLAY_FONT, weight: 800, tracking: -head.size * 0.015, upper: true,
      })).join("")
  );
}

/** Raj Sharma: subject bleeds the frame, headline and role sit over the wash. */
function buildAnnouncement(o: TemplateOptions) {
  const m = metrics(o.ratio);
  const c = o.colourway;
  const head = fitText(o.copy.headline, m.content, m.height * 0.2, m.scale.display * 0.9);
  const blockH = head.lines.length * head.size * 1.02;
  const subY = m.height - m.margin - m.scale.meta * 1.2;
  const headTop = subY - m.scale.meta * 2.2 - blockH;

  return (
    imageWell(0, 0, m.width, m.height, o, "SUBJECT") +
    `<defs><linearGradient id="tg-wash2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.to ?? c.ground}" stop-opacity="0"/><stop offset="0.6" stop-color="${c.to ?? c.ground}" stop-opacity="0.92"/></linearGradient></defs>` +
    `<rect x="0" y="${(m.height * 0.45).toFixed(2)}" width="${m.width}" height="${(m.height * 0.55).toFixed(2)}" fill="url(#tg-wash2)"/>` +
    head.lines.map((line, i) =>
      text(m.width / 2, headTop + head.size * 0.6 + i * head.size * 1.02, line, head.size, c.ink, {
        anchor: "middle", font: DISPLAY_FONT, weight: 800, tracking: -head.size * 0.015, upper: true,
      })).join("") +
    text(m.width / 2, subY, o.copy.subhead, m.scale.meta, c.ink, { anchor: "middle", weight: 700, upper: true })
  );
}

/** Breaking & Building: headline splits above and below a bleeding subject. */
function buildOverlap(o: TemplateOptions) {
  const m = metrics(o.ratio);
  const c = o.colourway;
  // The archetype is type above *and* below the subject, so a headline that
  // would fit on one line is forced to break.
  let all = fitText(o.copy.headline, m.content, m.height * 0.42, m.scale.display * 0.95);
  if (all.lines.length < 2) {
    const lines = wrapToLines(o.copy.headline, 2);
    const longest = lines.reduce((max, line) => Math.max(max, line.length), 1);
    all = { lines, size: Math.min(m.scale.display * 0.95, m.content / (longest * DISPLAY_WIDTH_FACTOR)) };
  }
  const split = Math.ceil(all.lines.length / 2);
  const topLines = all.lines.slice(0, split);
  const bottomLines = all.lines.slice(split);
  const size = all.size;
  const wellW = m.content * 0.62;

  return (
    // Type sits behind the subject at the top and in front of it at the bottom.
    topLines.map((line, i) =>
      text(m.width / 2, m.margin + size * 0.6 + i * size * 1.02, line, size, c.ink, {
        anchor: "middle", font: DISPLAY_FONT, weight: 800, tracking: -size * 0.015, upper: true,
      })).join("") +
    imageWell((m.width - wellW) / 2, m.height * 0.18, wellW, m.height * 0.7, o, "SUBJECT") +
    bottomLines.map((line, i) =>
      text(m.width / 2, m.height - m.margin - (bottomLines.length - 1 - i) * size * 1.02 - size * 0.4, line, size, c.ink, {
        anchor: "middle", font: DISPLAY_FONT, weight: 800, tracking: -size * 0.015, upper: true,
      })).join("") +
    annotation(m.margin, m.goldenY, o.copy.metaA, o.copy.metaB, m.scale.meta, c) +
    text(m.width - m.margin, m.goldenY, o.copy.metaC, m.scale.meta, c.ink, { anchor: "end", weight: 700, upper: true })
  );
}

/** Men's Grooming: corner annotations, floating object, headline along the base. */
function buildReport(o: TemplateOptions) {
  const m = metrics(o.ratio);
  const c = o.colourway;
  const head = fitText(o.copy.headline, m.content, m.height * 0.26, m.scale.display * 0.88);
  const blockH = head.lines.length * head.size * 1.02;
  const headTop = m.height - m.margin - blockH;
  const wellTop = m.margin + m.scale.micro * 4;
  const wellH = Math.max(headTop - m.scale.meta * 3 - wellTop, m.minor * 0.2);
  const wellW = Math.min(m.content * 0.66, wellH);

  return (
    annotation(m.margin, m.margin + m.scale.micro, o.copy.metaA, o.copy.metaB, m.scale.micro, c) +
    annotation(m.width - m.margin, m.margin + m.scale.micro, o.copy.eyebrow, o.copy.metaC, m.scale.micro, c, true) +
    imageWell((m.width - wellW) / 2, wellTop, wellW, wellH, o, "OBJECT") +
    text(m.margin, m.goldenY, o.copy.metaA, m.scale.meta, c.ink, { weight: 700, upper: true }) +
    text(m.width - m.margin, m.goldenY, o.copy.metaC, m.scale.meta, c.ink, { anchor: "end", weight: 700, upper: true }) +
    head.lines.map((line, i) =>
      text(m.margin, headTop + head.size * 0.6 + i * head.size * 1.02, line, head.size, c.ink, {
        font: DISPLAY_FONT, weight: 800, tracking: -head.size * 0.015, upper: true,
      })).join("")
  );
}

const BUILDERS: Record<TemplateKey, (options: TemplateOptions) => string> = {
  event: buildEvent,
  plates: buildPlates,
  guide: buildGuide,
  announcement: buildAnnouncement,
  overlap: buildOverlap,
  report: buildReport,
};

export function buildTemplateSvg(options: TemplateOptions) {
  const m = metrics(options.ratio);
  // Templates that are not shape-led always render square corners.
  const resolved: TemplateOptions = TEMPLATES[options.template].shape
    ? options
    : { ...options, steps: 0, cut: 0 };
  const body = BUILDERS[options.template](resolved);
  const guides = options.guides ? goldenGuides(m) : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m.width} ${m.height}" width="${m.width}" height="${m.height}" role="img" aria-label="Off/Beat ${TEMPLATES[options.template].name} template, ${options.ratio}">${ground(m, options.colourway)}${body}${guides}</svg>`;
}
