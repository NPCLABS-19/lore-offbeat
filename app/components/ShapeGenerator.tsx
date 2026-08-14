"use client";

import NextImage from "next/image";
import { useMemo, useState, type ChangeEvent, type CSSProperties } from "react";
import { svgToPng } from "@/app/lib/svgExport";

const MIN_DIMENSION = 80;
const MAX_DIMENSION = 2400;
const EXPORT_SCALE = 2;

type GeneratorState = {
  width: number;
  height: number;
  cornerCut: number;
  steps: number;
  squareCuts: boolean;
  rotation: number;
  layout: 1 | 2 | 3;
  fill: string;
  background: string;
  gradient: boolean;
  /** Data URL of an uploaded image, masked into the generated shape. */
  imageSrc: string | null;
  /** Rotate every shape in unison, like clock hands. */
  clockwork: boolean;
  sticker: boolean;
  label: string;
  number: string;
  stroke: number;
  ornamental: boolean;
  topText: string;
  sideText: string;
  centerText: string;
};

export type ShapeGeneratorProps = {
  className?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  accent?: string;
  ink?: string;
  paper?: string;
  assetName?: string;
};

const ASPECT_RATIOS = [
  { label: "1:1", value: 1 },
  { label: "φ:1", value: 1.618 },
  { label: "1:φ", value: 0.618 },
  { label: "4:5", value: 0.8 },
  { label: "2:3", value: 0.667 },
  { label: "16:9", value: 1.777 },
] as const;

const CORNER_PRESETS = [
  { label: "Subtle", value: 0.09 },
  { label: "φ", value: 0.191 },
  { label: "φ²", value: 0.309 },
  { label: "Cross", value: 0.382 },
] as const;

function clampDimension(value: number) {
  if (!Number.isFinite(value)) return MIN_DIMENSION;
  return Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, Math.round(value)));
}

function escapeXml(value: string) {
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

function shapePath(
  width: number,
  height: number,
  cutX: number,
  cutY: number,
  steps: number,
) {
  const points: Array<[number, number]> = [];
  const add = (x: number, y: number) =>
    points.push([Number(x.toFixed(2)), Number(y.toFixed(2))]);

  add(cutX, 0);
  add(width - cutX, 0);

  for (let index = 0; index < steps; index += 1) {
    const x = width - cutX + (index * cutX) / steps;
    add(x, ((index + 1) * cutY) / steps);
    add(x + cutX / steps, ((index + 1) * cutY) / steps);
  }

  add(width, height - cutY);

  for (let index = 0; index < steps; index += 1) {
    const y = height - cutY + (index * cutY) / steps;
    add(width - ((index + 1) * cutX) / steps, y);
    add(width - ((index + 1) * cutX) / steps, y + cutY / steps);
  }

  add(cutX, height);

  for (let index = 0; index < steps; index += 1) {
    const y = height - (index * cutY) / steps;
    add(cutX - (index * cutX) / steps, y - cutY / steps);
    add(cutX - ((index + 1) * cutX) / steps, y - cutY / steps);
  }

  add(0, cutY);

  for (let index = 0; index < steps; index += 1) {
    const x = (index * cutX) / steps;
    add(x + cutX / steps, cutY - (index * cutY) / steps);
    add(x + cutX / steps, cutY - ((index + 1) * cutY) / steps);
  }

  return `M${points.map((point) => point.join(" ")).join(" L ")} Z`;
}

function cutSizes(state: GeneratorState, width: number, height: number) {
  if (state.squareCuts) {
    const cut = Math.min(width, height) * state.cornerCut;
    return [cut, cut] as const;
  }

  return [width * state.cornerCut, height * state.cornerCut] as const;
}

function rotationTransform(width: number, height: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  const rotatedWidth = width * cosine + height * sine;
  const rotatedHeight = width * sine + height * cosine;
  const scale = Math.min(1, width / rotatedWidth, height / rotatedHeight);
  const centerX = width / 2;
  const centerY = height / 2;

  return `translate(${centerX} ${centerY}) rotate(${degrees}) scale(${scale.toFixed(
    5,
  )}) translate(${-centerX} ${-centerY})`;
}

function shapeGroup(
  state: GeneratorState,
  width: number,
  height: number,
  fillReference: string,
  ids: { next: number },
) {
  const [cutX, cutY] = cutSizes(state, width, height);
  const path = shapePath(width, height, cutX, cutY, state.steps);
  const stroke =
    state.sticker && state.stroke > 0
      ? ` stroke="${state.background}" stroke-width="${state.stroke}" stroke-linejoin="miter"`
      : "";

  let artwork: string;
  if (state.imageSrc) {
    const clipId = `obsg-clip-${ids.next}`;
    ids.next += 1;
    artwork =
      `<clipPath id="${clipId}"><path d="${path}"/></clipPath>` +
      `<image href="${state.imageSrc}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${clipId})"/>` +
      (stroke ? `<path d="${path}" fill="none"${stroke}/>` : "");
  } else {
    artwork = `<path d="${path}" fill="${fillReference}"${stroke}/>`;
  }

  const body = state.clockwork
    ? `<g><animateTransform attributeName="transform" type="rotate" from="0 ${width / 2} ${height / 2}" to="360 ${width / 2} ${height / 2}" dur="12s" repeatCount="indefinite"/>${artwork}</g>`
    : artwork;

  return `<g transform="${rotationTransform(width, height, state.rotation)}">${body}</g>`;
}

function ornamentalText(
  x: number,
  y: number,
  value: string,
  fontSize: number,
  rotation: number,
  fill: string,
) {
  if (!value) return "";
  const text = escapeXml(`·  ${value}  ·`);

  return `<text x="${x}" y="${y}" transform="rotate(${rotation} ${x} ${y})" text-anchor="middle" dominant-baseline="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="${fontSize * 0.14}" fill="${fill}">${text}</text>`;
}

function ornamentalFrame(state: GeneratorState) {
  const { width, height } = state;
  const minimum = Math.min(width, height);
  const edgeFontSize = Math.max(9, minimum * 0.028);
  let frame = "";

  frame += ornamentalText(
    width / 2,
    height * 0.05,
    state.topText,
    edgeFontSize,
    0,
    state.background,
  );
  frame += ornamentalText(
    width / 2,
    height * 0.95,
    state.topText,
    edgeFontSize,
    0,
    state.background,
  );
  frame += ornamentalText(
    width * 0.05,
    height / 2,
    state.sideText,
    edgeFontSize,
    -90,
    state.background,
  );
  frame += ornamentalText(
    width * 0.95,
    height / 2,
    state.sideText,
    edgeFontSize,
    90,
    state.background,
  );

  if (state.centerText) {
    const plaqueWidth = minimum * 0.4;
    const plaqueHeight = minimum * 0.16;
    const x = (width - plaqueWidth) / 2;
    const y = (height - plaqueHeight) / 2;
    const path = shapePath(
      plaqueWidth,
      plaqueHeight,
      plaqueWidth * 0.12,
      plaqueHeight * 0.3,
      1,
    );
    const fontSize = plaqueHeight * 0.44;

    frame += `<g transform="translate(${x} ${y})"><path d="${path}" fill="${state.background}"/><text x="${plaqueWidth / 2}" y="${plaqueHeight / 2}" text-anchor="middle" dominant-baseline="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="${fontSize * 0.02}" fill="${state.fill}">${escapeXml(state.centerText)}</text></g>`;
  }

  return frame;
}

function buildSvg(state: GeneratorState) {
  const { width, height } = state;
  const gradientId = "offbeat-shape-gradient";
  const definitions = state.gradient
    ? `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000000"/><stop offset="1" stop-color="${state.fill}"/></linearGradient></defs>`
    : "";
  const fillReference = state.gradient ? `url(#${gradientId})` : state.fill;
  const background = state.sticker
    ? ""
    : `<rect width="${width}" height="${height}" fill="${state.background}"/>`;
  const ids = { next: 0 };
  let body = "";

  if (state.layout === 1) {
    body = shapeGroup(state, width, height, fillReference, ids);
  } else {
    const columns = state.layout;
    const gap = Math.min(width, height) * 0.04;
    const cellWidth = (width - gap * (columns - 1)) / columns;
    const cellHeight = (height - gap * (columns - 1)) / columns;

    for (let row = 0; row < columns; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const x = column * (cellWidth + gap);
        const y = row * (cellHeight + gap);
        body += `<g transform="translate(${x} ${y})">${shapeGroup(
          state,
          cellWidth,
          cellHeight,
          fillReference,
          ids,
        )}</g>`;
      }
    }
  }

  let stickerLabel = "";
  if (state.sticker) {
    const fontSize = Math.max(10, Math.min(width, height) * 0.055);
    stickerLabel = `<text x="${width / 2}" y="${height * 0.5}" text-anchor="middle" dominant-baseline="middle" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="${fontSize}" letter-spacing="${fontSize * 0.02}" fill="${state.background}">${escapeXml(state.label)}<tspan font-size="${fontSize * 0.4}" dy="${-fontSize * 0.35}">${escapeXml(state.number)}</tspan></text>`;
  }

  const frame = state.ornamental ? ornamentalFrame(state) : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="offbeat-shape-title"><title id="offbeat-shape-title">Generated Off/Beat shape</title>${definitions}${background}${body}${stickerLabel}${frame}</svg>`;
}

function downloadBlob(name: string, blob: Blob) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = name;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fallbackCopy(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  textarea.remove();
  return copied;
}

export function ShapeGenerator({
  className = "",
  defaultWidth = 1000,
  defaultHeight = 1000,
  accent = "#FF00B4",
  ink = "#000000",
  paper = "#D1CDD2",
  assetName = "offbeat-shape",
}: ShapeGeneratorProps) {
  const [state, setState] = useState<GeneratorState>(() => ({
    width: clampDimension(defaultWidth),
    height: clampDimension(defaultHeight),
    cornerCut: 0.304,
    steps: 2,
    squareCuts: false,
    rotation: 90,
    layout: 2,
    fill: accent,
    background: ink,
    gradient: false,
    imageSrc: null,
    clockwork: false,
    sticker: false,
    label: "925 CLOCK",
    number: "02",
    stroke: 0,
    ornamental: false,
    topText: "ANTI 925",
    sideText: "GO FIND YOURSELF",
    centerText: "OFF/BEAT",
  }));
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [pngStatus, setPngStatus] = useState<"idle" | "rendering" | "failed">(
    "idle",
  );

  const svg = useMemo(() => buildSvg(state), [state]);
  const safeAssetName =
    assetName.trim().replace(/[^a-z0-9_-]+/gi, "-").toLowerCase() ||
    "offbeat-shape";
  const rootStyle = {
    "--obsg-accent": accent,
    "--obsg-ink": ink,
    "--obsg-paper": paper,
  } as CSSProperties;

  const patchState = (patch: Partial<GeneratorState>) => {
    setState((current) => ({ ...current, ...patch }));
  };

  const chooseRatio = (ratio: number) => {
    patchState({ height: clampDimension(state.width / ratio) });
  };

  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        patchState({ imageSrc: reader.result });
      }
    };
    reader.readAsDataURL(file);
    input.value = "";
  };

  const randomize = () => {
    const cornerCuts = [0.09, 0.191, 0.309, 0.382];
    const ratios = [1, 1.618, 0.618, 0.8, 0.667];
    const cornerCut = cornerCuts[Math.floor(Math.random() * cornerCuts.length)];
    const ratio = ratios[Math.floor(Math.random() * ratios.length)];

    setState((current) => ({
      ...current,
      cornerCut,
      height: clampDimension(current.width / ratio),
      steps: 1 + Math.floor(Math.random() * 4),
      rotation: Math.floor(Math.random() * 8) * 45,
      squareCuts: Math.random() < 0.4,
    }));
  };

  const downloadSvg = () => {
    downloadBlob(
      `${safeAssetName}.svg`,
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    );
  };

  const copySvg = async () => {
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(svg);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) copied = fallbackCopy(svg);
    setCopyStatus(copied ? "copied" : "failed");
    window.setTimeout(() => setCopyStatus("idle"), 1600);
  };

  const downloadPng = async () => {
    setPngStatus("rendering");
    try {
      const blob = await svgToPng(svg, state.width, state.height, EXPORT_SCALE);
      downloadBlob(`${safeAssetName}@2x.png`, blob);
      setPngStatus("idle");
    } catch {
      setPngStatus("failed");
    }
  };

  const themes = [
    { label: "Pink / Black", fill: accent, background: ink },
    { label: "Black / Pink", fill: ink, background: accent },
    { label: "Pink / Pale", fill: accent, background: paper },
    { label: "Black / Gray", fill: ink, background: "#D1CDD2" },
  ];

  return (
    <section
      className={`obsg-root ${className}`.trim()}
      style={rootStyle}
      aria-label="Off/Beat shape generator"
      data-lore-app="shape-generator"
    >
      <style>{componentStyles}</style>

      <aside className="obsg-controls">
        <div className="obsg-kicker">
          <span>Off/beat</span>
          <span>Design tool 01</span>
        </div>
        <div className="obsg-wordmark">Shape generator</div>
        <p className="obsg-subtitle">Aligned to φ 1.618</p>

        <fieldset className="obsg-group">
          <legend>Canvas</legend>
          <div className="obsg-fields">
            <label className="obsg-field">
              <span>Width</span>
              <input
                type="number"
                min={MIN_DIMENSION}
                max={MAX_DIMENSION}
                step={1}
                value={state.width}
                onChange={(event) =>
                  patchState({ width: clampDimension(event.currentTarget.valueAsNumber) })
                }
              />
            </label>
            <label className="obsg-field">
              <span>Height</span>
              <input
                type="number"
                min={MIN_DIMENSION}
                max={MAX_DIMENSION}
                step={1}
                value={state.height}
                onChange={(event) =>
                  patchState({ height: clampDimension(event.currentTarget.valueAsNumber) })
                }
              />
            </label>
          </div>
          <div className="obsg-chips" aria-label="Canvas aspect ratio">
            {ASPECT_RATIOS.map((ratio) => {
              const active = Math.abs(state.width / state.height - ratio.value) < 0.01;
              return (
                <button
                  key={ratio.label}
                  type="button"
                  className="obsg-chip"
                  aria-pressed={active}
                  onClick={() => chooseRatio(ratio.value)}
                >
                  {ratio.label}
                </button>
              );
            })}
          </div>
          <p className="obsg-hint">
            {MIN_DIMENSION}–{MAX_DIMENSION}px per side
          </p>
        </fieldset>

        <fieldset className="obsg-group">
          <legend>
            Corner cut <output>{state.cornerCut.toFixed(3)}</output>
          </legend>
          <div className="obsg-chips" aria-label="Corner cut presets">
            {CORNER_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="obsg-chip"
                aria-pressed={Math.abs(state.cornerCut - preset.value) < 0.0001}
                onClick={() => patchState({ cornerCut: preset.value })}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            aria-label="Corner cut"
            type="range"
            min={0.03}
            max={0.47}
            step={0.001}
            value={state.cornerCut}
            onChange={(event) =>
              patchState({ cornerCut: Number(event.currentTarget.value) })
            }
          />
        </fieldset>

        <fieldset className="obsg-group">
          <legend>
            Steps <output>{state.steps}</output>
          </legend>
          <input
            aria-label="Number of steps"
            type="range"
            min={1}
            max={4}
            step={1}
            value={state.steps}
            onChange={(event) =>
              patchState({ steps: Number(event.currentTarget.value) })
            }
          />
          <label className="obsg-toggle">
            <span>Square cuts</span>
            <input
              type="checkbox"
              checked={state.squareCuts}
              onChange={(event) => patchState({ squareCuts: event.currentTarget.checked })}
            />
          </label>
          <label className="obsg-range-label">
            <span>
              Rotate <output>{state.rotation}°</output>
            </span>
            <input
              aria-label="Rotation"
              type="range"
              min={0}
              max={360}
              step={5}
              value={state.rotation}
              onChange={(event) =>
                patchState({ rotation: Number(event.currentTarget.value) })
              }
            />
          </label>
        </fieldset>

        <fieldset className="obsg-group">
          <legend>Layout</legend>
          <div className="obsg-chips">
            {([1, 2, 3] as const).map((layout) => (
              <button
                key={layout}
                type="button"
                className="obsg-chip"
                aria-pressed={state.layout === layout}
                onClick={() => patchState({ layout })}
              >
                {layout === 1 ? "Single" : `${layout} × ${layout}`}
              </button>
            ))}
          </div>
          <label className="obsg-toggle">
            <span>Clockwork motion</span>
            <input
              type="checkbox"
              checked={state.clockwork}
              onChange={(event) => patchState({ clockwork: event.currentTarget.checked })}
            />
          </label>
          {state.clockwork ? (
            <p className="obsg-hint">
              Every shape rotates in unison, like clock hands. SVG export keeps the motion; PNG captures a still.
            </p>
          ) : null}
        </fieldset>

        <fieldset className="obsg-group">
          <legend>Image fill</legend>
          {state.imageSrc ? (
            <div className="obsg-image-row">
              <NextImage
                className="obsg-image-thumb"
                src={state.imageSrc}
                alt="Uploaded image used as shape fill"
                width={44}
                height={44}
                unoptimized
              />
              <button
                type="button"
                className="obsg-chip"
                onClick={() => patchState({ imageSrc: null })}
              >
                Remove image
              </button>
            </div>
          ) : (
            <label className="obsg-chip obsg-upload">
              Upload image
              <input type="file" accept="image/*" onChange={uploadImage} />
            </label>
          )}
          <p className="obsg-hint">
            Masked into the generated shape. The file stays in this browser.
          </p>
        </fieldset>

        <fieldset className="obsg-group">
          <legend>Theme</legend>
          <div className="obsg-chips">
            {themes.map((theme) => (
              <button
                key={theme.label}
                type="button"
                className="obsg-chip"
                aria-pressed={
                  state.fill.toLowerCase() === theme.fill.toLowerCase() &&
                  state.background.toLowerCase() === theme.background.toLowerCase()
                }
                onClick={() =>
                  patchState({ fill: theme.fill, background: theme.background })
                }
              >
                {theme.label}
              </button>
            ))}
          </div>
          <div className="obsg-color-fields">
            <label>
              <span>Fill</span>
              <input
                type="color"
                value={state.fill}
                onChange={(event) => patchState({ fill: event.currentTarget.value })}
              />
            </label>
            <label>
              <span>Background</span>
              <input
                type="color"
                value={state.background}
                onChange={(event) =>
                  patchState({ background: event.currentTarget.value })
                }
              />
            </label>
          </div>
          <label className="obsg-toggle">
            <span>Gradient fill</span>
            <input
              type="checkbox"
              checked={state.gradient}
              onChange={(event) => patchState({ gradient: event.currentTarget.checked })}
            />
          </label>
        </fieldset>

        <details className="obsg-advanced">
          <summary>Advanced artwork</summary>
          <div className="obsg-advanced-body">
            <label className="obsg-toggle">
              <span>Sticker mode</span>
              <input
                type="checkbox"
                checked={state.sticker}
                onChange={(event) => patchState({ sticker: event.currentTarget.checked })}
              />
            </label>
            {state.sticker ? (
              <div className="obsg-stacked-fields">
                <label className="obsg-field">
                  <span>Label</span>
                  <input
                    type="text"
                    value={state.label}
                    onChange={(event) => patchState({ label: event.currentTarget.value })}
                  />
                </label>
                <div className="obsg-fields">
                  <label className="obsg-field">
                    <span>Number</span>
                    <input
                      type="text"
                      value={state.number}
                      onChange={(event) => patchState({ number: event.currentTarget.value })}
                    />
                  </label>
                  <label className="obsg-field">
                    <span>Stroke</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={state.stroke}
                      onChange={(event) =>
                        patchState({
                          stroke: Math.max(0, event.currentTarget.valueAsNumber || 0),
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            ) : null}

            <label className="obsg-toggle">
              <span>Ornamental text</span>
              <input
                type="checkbox"
                checked={state.ornamental}
                onChange={(event) =>
                  patchState({ ornamental: event.currentTarget.checked })
                }
              />
            </label>
            {state.ornamental ? (
              <div className="obsg-stacked-fields">
                {(
                  [
                    ["Top / bottom", "topText"],
                    ["Sides", "sideText"],
                    ["Center plaque", "centerText"],
                  ] as const
                ).map(([label, field]) => (
                  <label className="obsg-field" key={field}>
                    <span>{label}</span>
                    <input
                      type="text"
                      value={state[field]}
                      onChange={(event) =>
                        patchState({ [field]: event.currentTarget.value })
                      }
                    />
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </details>

        <div className="obsg-actions">
          <button type="button" className="obsg-randomize" onClick={randomize}>
            Randomize
          </button>
          <div className="obsg-export-actions">
            <button type="button" onClick={downloadSvg}>
              SVG
            </button>
            <button
              type="button"
              onClick={downloadPng}
              disabled={pngStatus === "rendering"}
            >
              {pngStatus === "rendering" ? "Rendering…" : "PNG 2×"}
            </button>
            <button type="button" onClick={copySvg}>
              {copyStatus === "copied"
                ? "Copied"
                : copyStatus === "failed"
                  ? "Copy failed"
                  : "Copy SVG"}
            </button>
          </div>
          <p className="obsg-status" role="status" aria-live="polite">
            {pngStatus === "failed"
              ? "PNG export failed. SVG download remains available."
              : copyStatus === "failed"
                ? "Clipboard access was blocked. Download the SVG instead."
                : "Exports use the current canvas dimensions."}
          </p>
        </div>
      </aside>

      <div className="obsg-preview">
        <div className="obsg-preview-meta">
          <span>Live artboard</span>
          <strong>
            {state.width} × {state.height}
          </strong>
        </div>
        <div
          className={`obsg-artboard${state.sticker ? " is-transparent" : ""}`}
          style={{ aspectRatio: `${state.width} / ${state.height}` }}
        >
          <div className="obsg-svg" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
        <p className="obsg-preview-note">
          Stepped corners / {state.steps} step{state.steps === 1 ? "" : "s"} / φ {" "}
          {state.cornerCut.toFixed(3)}
        </p>
      </div>
    </section>
  );
}

const componentStyles = `
  .obsg-root {
    --obsg-panel: #111111;
    --obsg-line: rgba(255, 255, 255, 0.17);
    --obsg-muted: rgba(255, 255, 255, 0.52);
    display: grid;
    grid-template-columns: minmax(290px, 360px) minmax(0, 1fr);
    width: 100%;
    min-height: 720px;
    overflow: hidden;
    border: 1px solid var(--obsg-ink);
    background: var(--obsg-ink);
    color: #ffffff;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  .obsg-root *,
  .obsg-root *::before,
  .obsg-root *::after { box-sizing: border-box; }

  .obsg-controls {
    max-height: 780px;
    overflow-y: auto;
    border-right: 1px solid var(--obsg-accent);
    background: var(--obsg-panel);
    padding: 18px 18px 24px;
    scrollbar-color: var(--obsg-accent) transparent;
  }

  .obsg-kicker {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: var(--obsg-accent);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.18em;
  }

  .obsg-wordmark {
    display: inline-block;
    margin-top: 14px;
    background: var(--obsg-accent);
    color: var(--obsg-ink);
    padding: 9px 11px 8px;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 0.9;
  }

  .obsg-subtitle {
    margin: 7px 0 12px;
    color: var(--obsg-accent);
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.25em;
  }

  .obsg-group {
    min-width: 0;
    margin: 0;
    padding: 15px 0;
    border: 0;
    border-top: 1px solid var(--obsg-line);
  }

  .obsg-group legend,
  .obsg-advanced summary {
    width: 100%;
    margin: 0 0 10px;
    padding: 0;
    color: var(--obsg-muted);
    font: inherit;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .obsg-group legend output,
  .obsg-range-label output {
    float: right;
    color: var(--obsg-accent);
    font-size: 10px;
    letter-spacing: 0.06em;
  }

  .obsg-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .obsg-field,
  .obsg-range-label,
  .obsg-color-fields label {
    display: block;
    min-width: 0;
  }

  .obsg-field > span,
  .obsg-color-fields label > span,
  .obsg-range-label > span {
    display: block;
    margin-bottom: 5px;
    color: var(--obsg-muted);
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.17em;
    text-transform: uppercase;
  }

  .obsg-field input,
  .obsg-root input[type="number"],
  .obsg-root input[type="text"] {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--obsg-line);
    border-radius: 0;
    outline: 0;
    background: var(--obsg-ink);
    color: #ffffff;
    padding: 9px;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
  }

  .obsg-field input:focus-visible,
  .obsg-root input[type="number"]:focus-visible,
  .obsg-root input[type="text"]:focus-visible {
    border-color: var(--obsg-accent);
  }

  .obsg-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 9px;
  }

  .obsg-chip,
  .obsg-export-actions button {
    border: 1px solid var(--obsg-line);
    border-radius: 0;
    background: var(--obsg-ink);
    color: rgba(255,255,255,0.78);
    padding: 7px 9px;
    font: inherit;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .obsg-chip:hover,
  .obsg-chip:focus-visible,
  .obsg-export-actions button:hover,
  .obsg-export-actions button:focus-visible {
    border-color: var(--obsg-accent);
    color: #ffffff;
    outline: 0;
  }

  .obsg-chip[aria-pressed="true"] {
    border-color: var(--obsg-accent);
    background: var(--obsg-accent);
    color: var(--obsg-ink);
  }

  .obsg-root input[type="range"] {
    width: 100%;
    margin: 12px 0 3px;
    accent-color: var(--obsg-accent);
  }

  .obsg-hint,
  .obsg-status {
    margin: 8px 0 0;
    color: var(--obsg-muted);
    font-size: 8px;
    line-height: 1.4;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .obsg-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 9px;
    color: rgba(255,255,255,0.82);
    font-size: 10px;
    font-weight: 750;
    letter-spacing: 0.04em;
    cursor: pointer;
  }

  .obsg-toggle input {
    appearance: none;
    position: relative;
    width: 38px;
    min-width: 38px;
    height: 20px;
    margin: 0;
    border: 0;
    border-radius: 999px;
    background: #373737;
    cursor: pointer;
  }

  .obsg-toggle input::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #ffffff;
    transition: transform 150ms ease;
  }

  .obsg-toggle input:checked { background: var(--obsg-accent); }
  .obsg-toggle input:checked::after {
    background: var(--obsg-ink);
    transform: translateX(18px);
  }

  .obsg-toggle input:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }

  .obsg-range-label { margin-top: 13px; }

  .obsg-upload {
    display: inline-block;
    margin-top: 4px;
    cursor: pointer;
  }

  .obsg-upload input { display: none; }

  .obsg-image-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
  }

  .obsg-image-thumb {
    display: block;
    width: 44px;
    height: 44px;
    object-fit: cover;
    border: 1px solid var(--obsg-line);
  }

  .obsg-color-fields {
    display: flex;
    gap: 15px;
    margin-top: 13px;
  }

  .obsg-color-fields input[type="color"] {
    width: 44px;
    height: 32px;
    border: 1px solid var(--obsg-line);
    border-radius: 0;
    background: transparent;
    padding: 2px;
    cursor: pointer;
  }

  .obsg-advanced {
    border-top: 1px solid var(--obsg-line);
    padding: 15px 0;
  }

  .obsg-advanced summary {
    margin: 0;
    cursor: pointer;
    list-style-position: inside;
  }

  .obsg-advanced-body { padding-top: 4px; }
  .obsg-stacked-fields {
    display: grid;
    gap: 8px;
    margin-top: 10px;
  }

  .obsg-actions {
    border-top: 1px solid var(--obsg-line);
    padding-top: 16px;
  }

  .obsg-randomize {
    width: 100%;
    border: 1px solid var(--obsg-accent);
    border-radius: 0;
    background: var(--obsg-accent);
    color: var(--obsg-ink);
    padding: 12px;
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .obsg-randomize:hover,
  .obsg-randomize:focus-visible {
    filter: brightness(1.1);
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }

  .obsg-export-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
    margin-top: 8px;
  }

  .obsg-export-actions button { padding: 10px 4px; }
  .obsg-export-actions button:disabled { opacity: 0.45; cursor: wait; }

  .obsg-preview {
    position: relative;
    display: flex;
    min-width: 0;
    min-height: 720px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #080808;
    padding: clamp(50px, 7vw, 94px) clamp(22px, 6vw, 82px);
  }

  .obsg-preview-meta {
    position: absolute;
    top: 18px;
    left: 22px;
    display: flex;
    gap: 10px;
    color: rgba(255,255,255,0.32);
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.19em;
  }

  .obsg-preview-meta strong { color: var(--obsg-accent); }

  .obsg-artboard {
    position: relative;
    width: 100%;
    max-width: 900px;
    max-height: 610px;
    box-shadow: 0 28px 76px rgba(0,0,0,0.56);
  }

  .obsg-artboard.is-transparent {
    background-color: #ffffff;
    background-image:
      linear-gradient(45deg, #e4e4e4 25%, transparent 25%),
      linear-gradient(-45deg, #e4e4e4 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #e4e4e4 75%),
      linear-gradient(-45deg, transparent 75%, #e4e4e4 75%);
    background-position: 0 0, 0 10px, 10px -10px, -10px 0;
    background-size: 20px 20px;
  }

  .obsg-svg,
  .obsg-svg svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .obsg-svg svg { max-height: 610px; }

  .obsg-preview-note {
    position: absolute;
    right: 22px;
    bottom: 18px;
    margin: 0;
    color: rgba(255,255,255,0.3);
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.17em;
  }

  .obsg-kicker,
  .obsg-subtitle,
  .obsg-group legend,
  .obsg-advanced summary,
  .obsg-field > span,
  .obsg-color-fields label > span,
  .obsg-range-label > span,
  .obsg-chip,
  .obsg-export-actions button,
  .obsg-hint,
  .obsg-status,
  .obsg-randomize,
  .obsg-preview-meta,
  .obsg-preview-note {
    letter-spacing: 0.015em;
    text-transform: none;
  }

  .obsg-wordmark {
    letter-spacing: -0.02em;
    text-transform: none;
  }

  @media (max-width: 900px) {
    .obsg-root { grid-template-columns: 1fr; }
    .obsg-controls {
      max-height: none;
      border-right: 0;
      border-bottom: 1px solid var(--obsg-accent);
    }
    .obsg-preview { min-height: min(76vw, 620px); }
  }

  @media (max-width: 520px) {
    .obsg-controls { padding: 16px 14px 20px; }
    .obsg-preview {
      min-height: 390px;
      padding: 64px 18px 58px;
    }
    .obsg-preview-meta { left: 16px; }
    .obsg-preview-note {
      right: 16px;
      left: 16px;
      line-height: 1.5;
      text-align: right;
    }
    .obsg-export-actions { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .obsg-root *, .obsg-root *::before, .obsg-root *::after {
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

export default ShapeGenerator;
