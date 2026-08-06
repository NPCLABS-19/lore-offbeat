/**
 * Layout maths for the off/beat template generator.
 *
 * Every measurement descends from φ (1.618). Canvas splits fall on the
 * 61.8 / 38.2 line, margins are the canvas minor axis ÷ φ³, and the type
 * scale steps by φ so headline, subhead, and meta stay in proportion at any
 * ratio. The five templates are structural reductions of the published
 * off/beat social work — see SOURCE_MAP.md for the source posts.
 */
import { steppedRectPath } from "./steppedShape";

export const PHI = 1.618033988749895;
export const PHI_INV = 0.618033988749895;

export type RatioKey = "1:1" | "9:16" | "16:9";

export const RATIOS: Record<RatioKey, { width: number; height: number; use: string }> = {
  "1:1": { width: 1080, height: 1080, use: "Feed post" },
  "9:16": { width: 1080, height: 1920, use: "Story / reel" },
  "16:9": { width: 1920, height: 1080, use: "Presentation / banner" },
};

export type TemplateKey = "event" | "typeStack" | "guide" | "announcement" | "product";

export const TEMPLATES: Record<TemplateKey, { name: string; note: string }> = {
  event: { name: "Event", note: "Badge, framed subject, headline, meta row" },
  typeStack: { name: "Type stack", note: "Headline plates filling the canvas" },
  guide: { name: "Guide cover", note: "Full-bleed image, headline on the golden line" },
  announcement: { name: "Announcement", note: "Subject bleed with a headline and role" },
  product: { name: "Product drop", note: "Centred object, header lockup, spec lines" },
};

export type Colourway = { name: string; ground: string; ink: string; accent: string; accentInk: string };

export const COLOURWAYS: Colourway[] = [
  { name: "Signal pink", ground: "#FF00B4", ink: "#000000", accent: "#000000", accentInk: "#FF00B4" },
  { name: "Ink", ground: "#000000", ink: "#FFFFFF", accent: "#FF00B4", accentInk: "#000000" },
  { name: "Warm cream", ground: "#FFEFE9", ink: "#000000", accent: "#FF00B4", accentInk: "#000000" },
  { name: "Olive", ground: "#7C8152", ink: "#000000", accent: "#FFEFE9", accentInk: "#000000" },
  { name: "Sienna", ground: "#B7412E", ink: "#FFEFE9", accent: "#000000", accentInk: "#FFEFE9" },
  { name: "Soft lilac", ground: "#D1CDD2", ink: "#000000", accent: "#FF00B4", accentInk: "#000000" },
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
  eyebrow: "OFF/BEAT PRESENTS",
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
  /** Stepped corner cuts on plates and frames; 0 keeps corners square. */
  steps: number;
  cut: number;
  guides: boolean;
};

const DISPLAY_FONT = "Archivo, 'Arial Narrow', Helvetica, Arial, sans-serif";
const VOICE_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function esc(value: string) {
  return value.replace(/[<>&"']/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}

/** Geometry shared by every template, all derived from φ. */
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
    /** The dominant 61.8 / 38.2 division. */
    goldenY: height * PHI_INV,
    goldenX: width * PHI_INV,
    scale: {
      micro: base * Math.pow(PHI_INV, 1.5),
      meta: base * PHI_INV,
      body: base,
      subhead: base * PHI,
      display: base * Math.pow(PHI, ratio === "16:9" ? 2.4 : 2.8),
    },
  };
}

/** A stepped plate, or a plain rect when steps is 0. */
function plate(x: number, y: number, w: number, h: number, fill: string, steps: number, cut: number) {
  if (steps <= 0) {
    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" fill="${fill}"/>`;
  }
  return `<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)})"><path d="${steppedRectPath(w, h, cut, steps)}" fill="${fill}"/></g>`;
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
  // Archivo ships as a variable font: social headlines need the narrow width
  // axis, the same setting the type tester uses.
  const variation =
    font === DISPLAY_FONT ? ` style="font-variation-settings:&apos;wdth&apos; 62,&apos;wght&apos; ${weight}"` : "";

  return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" fill="${fill}" font-family="${font}" font-size="${size.toFixed(2)}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${tracking.toFixed(3)}" dominant-baseline="middle"${variation}>${esc(content)}</text>`;
}

/** Break a value into at most `maxLines` lines, keeping words whole. */
function wrapToLines(value: string, maxLines: number) {
  const words = value.split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  if (maxLines <= 1) return [words.join(" ")];

  // Greedy balance: aim for equal character counts across the line count.
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
 * Fit a headline to a box.
 *
 * SVG has no text measurement, and the layout must stay deterministic on the
 * server, so glyph width is approximated. Measured against Archivo at the
 * narrow width axis (wdth 62), bold uppercase averages ~0.50em per character;
 * the Arial Narrow fallback sits just under that. The estimate is deliberately
 * slightly generous so type lands inside the margin rather than on it.
 */
export const DISPLAY_WIDTH_FACTOR = 0.52;

function fitText(
  value: string,
  maxWidth: number,
  maxHeight: number,
  maxSize: number,
  widthFactor = DISPLAY_WIDTH_FACTOR,
  lineHeight = 1.04,
) {
  let best = { lines: [value], size: 0 };

  for (let count = 1; count <= 5; count += 1) {
    const lines = wrapToLines(value, count);
    if (lines.length !== count && count > 1) continue;
    const longest = lines.reduce((max, line) => Math.max(max, line.length), 1);
    const byWidth = maxWidth / (longest * widthFactor);
    const byHeight = maxHeight / (count * lineHeight);
    const size = Math.min(maxSize, byWidth, byHeight);
    if (size > best.size) best = { lines, size };
  }

  return best;
}

/** Placeholder image well: a tinted field with a cross and a label. */
function imageWell(
  x: number,
  y: number,
  w: number,
  h: number,
  options: TemplateOptions,
  label = "IMAGE",
) {
  const { colourway, steps, cut } = options;
  const clipId = `well-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}`;
  const line = Math.max(1.5, Math.min(w, h) * 0.006);

  // Outline and clip share one path so the edge always follows the silhouette
  // rather than a rectangle drawn over it.
  const outline =
    steps > 0
      ? `<path transform="translate(${x.toFixed(2)} ${y.toFixed(2)})" d="${steppedRectPath(w, h, cut, steps)}"`
      : `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}"`;

  const fill = `${outline} fill="${colourway.ink}" opacity="0.2"/>`;
  const stroke = `${outline} fill="none" stroke="${colourway.ink}" stroke-width="${line}" opacity="0.5"/>`;
  const cross =
    `<defs><clipPath id="${clipId}">${outline} /></clipPath></defs>` +
    `<g clip-path="url(#${clipId})"><path d="M${x.toFixed(2)} ${y.toFixed(2)} L${(x + w).toFixed(2)} ${(y + h).toFixed(2)} M${(x + w).toFixed(2)} ${y.toFixed(2)} L${x.toFixed(2)} ${(y + h).toFixed(2)}" stroke="${colourway.ink}" stroke-width="${line}" opacity="0.34"/></g>`;

  return (
    fill +
    cross +
    stroke +
    text(x + w / 2, y + h / 2, label, Math.max(11, Math.min(w, h) * 0.055), colourway.ink, {
      anchor: "middle",
      weight: 700,
      tracking: Math.min(w, h) * 0.005,
      upper: true,
    })
  );
}

/** Small corner annotations — the micro detail that carries the brand. */
function cornerMarks(m: ReturnType<typeof metrics>, c: Colourway, copy: TemplateCopy) {
  const size = m.scale.micro;
  return (
    text(m.margin, m.margin * 0.72, copy.metaA, size, c.ink, { weight: 700, tracking: size * 0.16, upper: true }) +
    text(m.width - m.margin, m.margin * 0.72, copy.metaB, size, c.ink, {
      anchor: "end",
      weight: 700,
      tracking: size * 0.16,
      upper: true,
    })
  );
}

/** The bracketed OFF/BEAT lockup, drawn from the stepped system. */
function lockup(cx: number, cy: number, width: number, options: TemplateOptions) {
  const { colourway, steps, cut } = options;
  const height = width * 0.28;
  const x = cx - width / 2;
  const y = cy - height / 2;
  return (
    plate(x, y, width, height, colourway.accent, Math.max(1, Math.min(steps, 2)), cut || 0.191) +
    text(cx, cy, "OFF/BEAT", height * 0.46, colourway.accentInk, {
      anchor: "middle",
      weight: 800,
      tracking: -height * 0.01,
    })
  );
}

function goldenGuides(m: ReturnType<typeof metrics>) {
  const stroke = `stroke="#00E5FF" stroke-width="${Math.max(1, m.minor * 0.0015)}" stroke-dasharray="${m.minor * 0.012} ${m.minor * 0.008}" opacity="0.85"`;
  return (
    `<line x1="0" y1="${m.goldenY.toFixed(2)}" x2="${m.width}" y2="${m.goldenY.toFixed(2)}" ${stroke}/>` +
    `<line x1="0" y1="${(m.height - m.goldenY).toFixed(2)}" x2="${m.width}" y2="${(m.height - m.goldenY).toFixed(2)}" ${stroke}/>` +
    `<line x1="${m.goldenX.toFixed(2)}" y1="0" x2="${m.goldenX.toFixed(2)}" y2="${m.height}" ${stroke}/>` +
    `<line x1="${(m.width - m.goldenX).toFixed(2)}" y1="0" x2="${(m.width - m.goldenX).toFixed(2)}" y2="${m.height}" ${stroke}/>` +
    `<rect x="${m.margin.toFixed(2)}" y="${m.margin.toFixed(2)}" width="${(m.width - m.margin * 2).toFixed(2)}" height="${(m.height - m.margin * 2).toFixed(2)}" fill="none" ${stroke}/>`
  );
}

function buildEvent(o: TemplateOptions) {
  const m = metrics(o.ratio);
  const c = o.colourway;
  const content = m.width - m.margin * 2;

  // Zones: header, then the image well down to the golden line, then type.
  const lockupWidth = Math.min(content * 0.42, m.width * 0.36);
  const lockupY = m.margin + lockupWidth * 0.15;
  const eyebrowY = lockupY + lockupWidth * 0.22;
  const wellTop = eyebrowY + m.scale.meta * 2;

  const footerY = m.height - m.margin;
  const subY = footerY - m.scale.meta * 2.4;
  const typeTop = wellTop + (m.goldenY - wellTop) + m.margin * 0.6;
  const headBudget = subY - m.scale.subhead * 1.2 - typeTop;

  const head = fitText(o.copy.headline, content, Math.max(headBudget, m.scale.display), m.scale.display);
  const headBlock = head.lines.length * head.size * 1.04;
  const headTop = subY - m.scale.meta * 1.6 - headBlock;

  // The framed subject reads as a window, so keep it from going letterbox-wide.
  const wellBottom = Math.max(m.goldenY, headTop - m.margin * 0.6);
  const wellH = Math.max(wellBottom - wellTop, m.minor * 0.22);
  const wellW = Math.min(content, wellH * 1.15);
  const wellX = (m.width - wellW) / 2;

  return (
    lockup(m.width / 2, lockupY, lockupWidth, o) +
    text(m.width / 2, eyebrowY, o.copy.eyebrow, m.scale.meta, c.ink, {
      anchor: "middle",
      weight: 700,
      tracking: m.scale.meta * 0.14,
      upper: true,
    }) +
    imageWell(wellX, wellTop, wellW, wellH, o, "SUBJECT") +
    head.lines
      .map((line, index) =>
        text(m.width / 2, headTop + head.size * 0.62 + index * head.size * 1.04, line, head.size, c.ink, {
          anchor: "middle",
          font: DISPLAY_FONT,
          weight: 800,
          tracking: -head.size * 0.015,
          upper: true,
        }),
      )
      .join("") +
    text(m.width / 2, subY, o.copy.subhead, m.scale.meta, c.ink, { anchor: "middle", weight: 500 }) +
    text(m.margin, footerY - m.scale.meta * 0.4, o.copy.metaA, m.scale.meta, c.ink, {
      weight: 700,
      tracking: m.scale.meta * 0.1,
      upper: true,
    }) +
    text(m.width / 2, footerY - m.scale.meta * 0.4, o.copy.metaB, m.scale.meta, c.ink, {
      anchor: "middle",
      weight: 700,
      tracking: m.scale.meta * 0.1,
      upper: true,
    }) +
    text(m.width - m.margin, footerY - m.scale.meta * 0.4, o.copy.metaC, m.scale.meta, c.ink, {
      anchor: "end",
      weight: 700,
      tracking: m.scale.meta * 0.1,
      upper: true,
    })
  );
}

function buildTypeStack(o: TemplateOptions) {
  const m = metrics(o.ratio);
  const c = o.colourway;
  const content = m.width - m.margin * 2;
  const top = m.margin + m.scale.micro * 2.4;
  const bottom = m.height - m.margin - m.scale.meta * 2;
  // Plates carry inset padding, so fit the type to the inner width.
  const inset = content * 0.045;
  const head = fitText(o.copy.headline, content - inset * 2, bottom - top, m.width * 0.17);
  const lineH = head.size * 1.22;
  const blockTop = top + (bottom - top - lineH * head.lines.length) / 2;

  const stack = head.lines
    .map((line, index) => {
      const y = blockTop + index * lineH;
      // Plate carries headroom over the fitting estimate so type never breaches it.
      const w = Math.min(content, line.length * head.size * (DISPLAY_WIDTH_FACTOR + 0.06) + inset * 2);
      return (
        plate(m.margin, y, w, lineH * 0.88, c.accent, o.steps, o.cut) +
        text(m.margin + inset, y + lineH * 0.44, line, head.size, c.accentInk, {
          font: DISPLAY_FONT,
          weight: 800,
          tracking: -head.size * 0.02,
          upper: true,
        })
      );
    })
    .join("");

  return (
    cornerMarks(m, c, o.copy) +
    stack +
    text(m.width / 2, m.height - m.margin, o.copy.metaC, m.scale.meta, c.ink, {
      anchor: "middle",
      weight: 700,
      tracking: m.scale.meta * 0.14,
      upper: true,
    })
  );
}

function buildGuide(o: TemplateOptions) {
  const m = metrics(o.ratio);
  const c = o.colourway;
  const content = m.width - m.margin * 2;
  // Type occupies the lower 38.2%; the wash starts a little above it.
  const typeZone = m.height - m.goldenY;
  const head = fitText(o.copy.headline, content, typeZone * 0.62, m.scale.display * 0.78);
  const blockH = head.lines.length * head.size * 1.04;
  const headTop = m.height - m.margin - blockH;

  return (
    imageWell(0, 0, m.width, m.height, { ...o, steps: 0 }, "FULL BLEED IMAGE") +
    `<rect x="0" y="${(m.goldenY * 0.82).toFixed(2)}" width="${m.width}" height="${(m.height - m.goldenY * 0.82).toFixed(2)}" fill="${c.ground}" opacity="0.75"/>` +
    text(m.margin, headTop - m.scale.meta * 1.6, o.copy.eyebrow, m.scale.meta, c.ink, {
      weight: 700,
      tracking: m.scale.meta * 0.16,
      upper: true,
    }) +
    head.lines
      .map((line, index) =>
        text(m.margin, headTop + head.size * 0.62 + index * head.size * 1.04, line, head.size, c.ink, {
          font: DISPLAY_FONT,
          weight: 800,
          tracking: -head.size * 0.015,
          upper: true,
        }),
      )
      .join("")
  );
}

function buildAnnouncement(o: TemplateOptions) {
  const m = metrics(o.ratio);
  const c = o.colourway;
  const vertical = o.ratio !== "16:9";
  const wellW = vertical ? m.width : m.goldenX;
  const wellH = vertical ? m.goldenY : m.height;
  const textX = vertical ? m.margin : m.goldenX + m.margin;
  const textW = (vertical ? m.width : m.width - m.goldenX) - m.margin * 2;
  const zoneTop = vertical ? m.goldenY : 0;
  const zoneH = vertical ? m.height - m.goldenY : m.height;
  const lockupW = Math.min(textW * 0.5, m.width * 0.2);

  const head = fitText(o.copy.headline, textW, zoneH * 0.4, m.scale.display * 0.66);
  const blockH = head.lines.length * head.size * 1.04;
  const lockupH = lockupW * 0.28;
  // Reserve the lockup's own height plus a gap so it never sits on the type.
  const group = lockupH * 1.9 + blockH + m.scale.meta * 2.2;
  const blockTop = zoneTop + Math.max((zoneH - group) / 2, m.margin * 0.5) + lockupH * 1.9;

  return (
    imageWell(0, 0, wellW, wellH, { ...o, steps: 0 }, "SUBJECT") +
    (vertical
      ? `<rect x="0" y="${m.goldenY.toFixed(2)}" width="${m.width}" height="${(m.height - m.goldenY).toFixed(2)}" fill="${c.ground}"/>`
      : `<rect x="${m.goldenX.toFixed(2)}" y="0" width="${(m.width - m.goldenX).toFixed(2)}" height="${m.height}" fill="${c.ground}"/>`) +
    lockup(textX + lockupW / 2, blockTop - lockupH * 1.15, lockupW, o) +
    head.lines
      .map((line, index) =>
        text(textX, blockTop + head.size * 0.62 + index * head.size * 1.04, line, head.size, c.ink, {
          font: DISPLAY_FONT,
          weight: 800,
          tracking: -head.size * 0.015,
          upper: true,
        }),
      )
      .join("") +
    text(textX, blockTop + blockH + m.scale.meta * 1.2, o.copy.subhead, m.scale.meta, c.ink, { weight: 500 })
  );
}

function buildProduct(o: TemplateOptions) {
  const m = metrics(o.ratio);
  const c = o.colourway;
  const content = m.width - m.margin * 2;
  const lockupWidth = m.width * 0.3;
  const lockupY = m.margin + lockupWidth * 0.18;
  const nameY = lockupY + lockupWidth * 0.24;
  // The product name is copy, so it has to fit like any other headline.
  const name = fitText(o.copy.headline, content, m.scale.subhead * 2.6, m.scale.subhead, 0.6);
  const nameBlock = name.lines.length * name.size * 1.06;
  const subY = nameY + nameBlock + m.scale.meta * 0.6;
  const wellY = subY + m.scale.meta * 1.6;
  const wellSize = Math.min(content, Math.max(m.height - wellY - m.margin * 2.2, m.minor * 0.25));

  return (
    text(m.margin, lockupY, o.copy.metaA, m.scale.micro, c.ink, {
      weight: 700,
      tracking: m.scale.micro * 0.18,
      upper: true,
    }) +
    text(m.width - m.margin, lockupY, o.copy.metaB, m.scale.micro, c.ink, {
      anchor: "end",
      weight: 700,
      tracking: m.scale.micro * 0.18,
      upper: true,
    }) +
    lockup(m.width / 2, lockupY, lockupWidth, o) +
    name.lines
      .map((line, index) =>
        text(m.width / 2, nameY + index * name.size * 1.06, line, name.size, c.accent, {
          anchor: "middle",
          weight: 800,
          tracking: name.size * 0.02,
          upper: true,
        }),
      )
      .join("") +
    text(m.width / 2, subY, o.copy.subhead, m.scale.meta, c.accent, { anchor: "middle", weight: 700 }) +
    imageWell((m.width - wellSize) / 2, wellY, wellSize, wellSize, o, "OBJECT") +
    text(m.width / 2, m.height - m.margin, o.copy.metaC, m.scale.meta, c.ink, {
      anchor: "middle",
      weight: 700,
      tracking: m.scale.meta * 0.14,
      upper: true,
    })
  );
}

const BUILDERS: Record<TemplateKey, (options: TemplateOptions) => string> = {
  event: buildEvent,
  typeStack: buildTypeStack,
  guide: buildGuide,
  announcement: buildAnnouncement,
  product: buildProduct,
};

export function buildTemplateSvg(options: TemplateOptions) {
  const m = metrics(options.ratio);
  const body = BUILDERS[options.template](options);
  const guides = options.guides ? goldenGuides(m) : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m.width} ${m.height}" width="${m.width}" height="${m.height}" role="img" aria-label="Off/Beat ${TEMPLATES[options.template].name} template, ${options.ratio}"><rect width="${m.width}" height="${m.height}" fill="${options.colourway.ground}"/>${body}${guides}</svg>`;
}
