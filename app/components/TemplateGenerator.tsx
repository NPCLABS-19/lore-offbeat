"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  buildTemplateSvg,
  COLOURWAYS,
  PLACEHOLDER_COPY,
  RATIOS,
  TEMPLATES,
  type Colourway,
  type RatioKey,
  type TemplateCopy,
  type TemplateKey,
} from "@/app/lib/templateLayout";
import { copyToClipboard, downloadBlob, downloadSvgSource, svgToPng } from "@/app/lib/svgExport";

const CUT_PRESETS = [
  { label: "Square", steps: 0, cut: 0 },
  { label: "1 step", steps: 1, cut: 0.191 },
  { label: "3 steps", steps: 3, cut: 0.191 },
  { label: "4 steps", steps: 4, cut: 0.309 },
  { label: "2 · advertising", steps: 2, cut: 0.309 },
] as const;

const COPY_FIELDS: Array<{ key: keyof TemplateCopy; label: string }> = [
  { key: "eyebrow", label: "Eyebrow" },
  { key: "headline", label: "Headline" },
  { key: "subhead", label: "Subhead" },
  { key: "metaA", label: "Meta left" },
  { key: "metaB", label: "Meta centre" },
  { key: "metaC", label: "Meta right" },
];

export type TemplateGeneratorProps = {
  accent?: string;
  ink?: string;
  paper?: string;
};

export function TemplateGenerator({
  accent = "#FF00B4",
  ink = "#000000",
  paper = "#D1CDD2",
}: TemplateGeneratorProps) {
  const [ratio, setRatio] = useState<RatioKey>("1:1");
  const [template, setTemplate] = useState<TemplateKey>("event");
  const [colourway, setColourway] = useState<Colourway>(COLOURWAYS[0]);
  const [copy, setCopy] = useState<TemplateCopy>(PLACEHOLDER_COPY);
  const [preset, setPreset] = useState(1);
  const [guides, setGuides] = useState(true);
  const [status, setStatus] = useState("Placeholder copy is editable. Exports use the full canvas size.");

  const usesShape = TEMPLATES[template].shape;
  const { steps, cut } = CUT_PRESETS[preset];
  const svg = useMemo(
    () => buildTemplateSvg({ ratio, template, colourway, copy, steps, cut, guides }),
    [ratio, template, colourway, copy, steps, cut, guides],
  );
  const { width, height, use } = RATIOS[ratio];

  const rootStyle = { "--tg-accent": accent, "--tg-ink": ink, "--tg-paper": paper } as CSSProperties;
  const fileName = `offbeat-${template}-${ratio.replace(":", "x")}`;

  const exportPng = async () => {
    setStatus("Rendering PNG…");
    try {
      // Guides are a working aid, never part of the artwork.
      const artwork = buildTemplateSvg({ ratio, template, colourway, copy, steps, cut, guides: false });
      const blob = await svgToPng(artwork, width, height, 2);
      downloadBlob(`${fileName}@2x.png`, blob);
      setStatus("PNG exported at 2× canvas size.");
    } catch {
      setStatus("PNG export failed. The SVG download still works.");
    }
  };

  const exportSvg = () => {
    downloadSvgSource(
      `${fileName}.svg`,
      buildTemplateSvg({ ratio, template, colourway, copy, steps, cut, guides: false }),
    );
    setStatus("SVG exported without guides.");
  };

  const copySvg = async () => {
    const copied = await copyToClipboard(
      buildTemplateSvg({ ratio, template, colourway, copy, steps, cut, guides: false }),
    );
    setStatus(copied ? "SVG copied to the clipboard." : "Clipboard was blocked. Download the SVG instead.");
  };

  return (
    <section className="tg-root" style={rootStyle} aria-label="Off/Beat template generator" data-lore-app="template-generator">
      <style>{componentStyles}</style>

      <aside className="tg-controls">
        <div className="tg-kicker">
          <span>Off/beat</span>
          <span>Design tool 02</span>
        </div>
        <div className="tg-wordmark">Template generator</div>
        <p className="tg-subtitle">Every measure derived from φ 1.618</p>

        <fieldset className="tg-group">
          <legend>Ratio</legend>
          <div className="tg-chips">
            {(Object.keys(RATIOS) as RatioKey[]).map((key) => (
              <button key={key} type="button" className="tg-chip" aria-pressed={ratio === key} onClick={() => setRatio(key)}>
                {key}
              </button>
            ))}
          </div>
          <p className="tg-hint">{use} · {width} × {height}</p>
        </fieldset>

        <fieldset className="tg-group">
          <legend>Template <span className="tg-legend-note">◧ uses the cut</span></legend>
          <div className="tg-stack">
            {(Object.keys(TEMPLATES) as TemplateKey[]).map((key) => (
              <button
                key={key}
                type="button"
                className="tg-option"
                aria-pressed={template === key}
                onClick={() => setTemplate(key)}
              >
                <strong>{TEMPLATES[key].name}{TEMPLATES[key].shape ? " ◧" : ""}</strong>
                <span>{TEMPLATES[key].note}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="tg-group">
          <legend>Colourway</legend>
          <div className="tg-swatches">
            {COLOURWAYS.map((option) => (
              <button
                key={option.name}
                type="button"
                className="tg-swatch"
                aria-pressed={colourway.name === option.name}
                aria-label={option.name}
                title={option.name}
                style={{ background: option.ground, color: option.ink }}
                onClick={() => setColourway(option)}
              >
                <span style={{ background: option.accent }} />
              </button>
            ))}
          </div>
          <p className="tg-hint">{colourway.name}</p>
        </fieldset>

        <fieldset className="tg-group" disabled={!usesShape}>
          <legend>Corner cut</legend>
          <div className="tg-chips">
            {CUT_PRESETS.map((option, index) => (
              <button key={option.label} type="button" className="tg-chip" aria-pressed={usesShape && preset === index} onClick={() => setPreset(index)}>
                {option.label}
              </button>
            ))}
          </div>
          <p className="tg-hint">
            {!usesShape
              ? "This layout carries no stepped shape — most off/beat work does not. Colour and type do the work."
              : steps === 2
                ? "Two steps is the iconic cut — billboards, banners, and environmental takeovers only."
                : steps === 0
                  ? "Square corners suit small formats and interface work."
                  : "Free to experiment, as long as the corners have room to read."}
          </p>
        </fieldset>

        <fieldset className="tg-group">
          <legend>Placeholder copy</legend>
          <div className="tg-fields">
            {COPY_FIELDS.map((field) => (
              <label className="tg-field" key={field.key}>
                <span>{field.label}</span>
                <input
                  type="text"
                  value={copy[field.key]}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setCopy((current) => ({ ...current, [field.key]: value }));
                  }}
                />
              </label>
            ))}
          </div>
          <button type="button" className="tg-chip tg-reset" onClick={() => setCopy(PLACEHOLDER_COPY)}>
            Reset copy
          </button>
        </fieldset>

        <div className="tg-actions">
          <label className="tg-toggle">
            <span>Golden ratio guides</span>
            <input type="checkbox" checked={guides} onChange={(event) => setGuides(event.currentTarget.checked)} />
          </label>
          <div className="tg-export">
            <button type="button" onClick={exportSvg}>SVG</button>
            <button type="button" onClick={exportPng}>PNG 2×</button>
            <button type="button" onClick={copySvg}>Copy SVG</button>
          </div>
          <p className="tg-status" role="status" aria-live="polite">{status}</p>
        </div>
      </aside>

      <div className="tg-preview">
        <div className="tg-preview-meta">
          <span>Live template</span>
          <strong>{TEMPLATES[template].name} · {ratio}</strong>
        </div>
        <div className="tg-artboard" style={{ aspectRatio: `${width} / ${height}` }}>
          <div className="tg-svg" dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
        <p className="tg-preview-note">Guides are a working aid and never export</p>
      </div>
    </section>
  );
}

const componentStyles = `
  .tg-root {
    --tg-panel: #111111;
    --tg-line: rgba(255, 255, 255, 0.17);
    --tg-muted: rgba(255, 255, 255, 0.52);
    display: grid;
    grid-template-columns: minmax(300px, 370px) minmax(0, 1fr);
    width: 100%;
    min-height: 760px;
    overflow: hidden;
    border: 1px solid var(--tg-ink);
    background: var(--tg-ink);
    color: #ffffff;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  }

  .tg-root *, .tg-root *::before, .tg-root *::after { box-sizing: border-box; }

  .tg-controls {
    max-height: 860px;
    overflow-y: auto;
    border-right: 1px solid var(--tg-accent);
    background: var(--tg-panel);
    padding: 18px 18px 24px;
    scrollbar-color: var(--tg-accent) transparent;
  }

  .tg-kicker {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    color: var(--tg-accent);
    font-size: 9px;
    font-weight: 800;
  }

  .tg-wordmark {
    display: inline-block;
    margin-top: 14px;
    background: var(--tg-accent);
    color: var(--tg-ink);
    padding: 9px 11px 8px;
    font-size: 21px;
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 0.9;
  }

  .tg-subtitle { margin: 7px 0 12px; color: var(--tg-accent); font-size: 9px; font-weight: 800; }

  .tg-group {
    min-width: 0;
    margin: 0;
    padding: 15px 0;
    border: 0;
    border-top: 1px solid var(--tg-line);
  }

  .tg-group legend {
    width: 100%;
    margin: 0 0 10px;
    padding: 0;
    color: var(--tg-muted);
    font: inherit;
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.02em;
  }

  .tg-chips { display: flex; flex-wrap: wrap; gap: 6px; }

  .tg-chip, .tg-export button {
    border: 1px solid var(--tg-line);
    border-radius: 0;
    background: var(--tg-ink);
    color: rgba(255,255,255,0.78);
    padding: 7px 9px;
    font: inherit;
    font-size: 9px;
    font-weight: 850;
    cursor: pointer;
  }

  .tg-chip:hover, .tg-chip:focus-visible,
  .tg-export button:hover, .tg-export button:focus-visible {
    border-color: var(--tg-accent);
    color: #ffffff;
    outline: 0;
  }

  .tg-chip[aria-pressed="true"] { border-color: var(--tg-accent); background: var(--tg-accent); color: var(--tg-ink); }

  .tg-stack { display: grid; gap: 6px; }

  .tg-option {
    display: grid;
    gap: 2px;
    border: 1px solid var(--tg-line);
    background: var(--tg-ink);
    color: rgba(255,255,255,0.78);
    padding: 9px 10px;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .tg-option strong { font-size: 11px; font-weight: 700; }
  .tg-option span { font-size: 9px; color: var(--tg-muted); }
  .tg-option[aria-pressed="true"] { border-color: var(--tg-accent); }
  .tg-option[aria-pressed="true"] strong { color: var(--tg-accent); }
  .tg-option:hover, .tg-option:focus-visible { border-color: var(--tg-accent); outline: 0; }

  .tg-swatches { display: flex; flex-wrap: wrap; gap: 7px; }

  .tg-swatch {
    position: relative;
    width: 42px;
    height: 30px;
    border: 1px solid var(--tg-line);
    border-radius: 0;
    padding: 0;
    cursor: pointer;
  }

  .tg-swatch span { position: absolute; right: 3px; bottom: 3px; width: 10px; height: 10px; }
  .tg-swatch[aria-pressed="true"] { outline: 2px solid var(--tg-accent); outline-offset: 1px; }

  .tg-fields { display: grid; gap: 8px; }
  .tg-field { display: block; min-width: 0; }
  .tg-field > span { display: block; margin-bottom: 4px; color: var(--tg-muted); font-size: 8px; font-weight: 800; }

  .tg-field input {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--tg-line);
    border-radius: 0;
    outline: 0;
    background: var(--tg-ink);
    color: #ffffff;
    padding: 8px;
    font: inherit;
    font-size: 12px;
    font-weight: 600;
  }

  .tg-field input:focus-visible { border-color: var(--tg-accent); }
  .tg-reset { margin-top: 10px; }

  .tg-hint, .tg-status { margin: 8px 0 0; color: var(--tg-muted); font-size: 9px; line-height: 1.45; }
  .tg-legend-note { float: right; font-weight: 700; opacity: 0.75; }
  .tg-group[disabled] { opacity: 0.45; }
  .tg-group[disabled] .tg-chip { cursor: not-allowed; }

  .tg-actions { border-top: 1px solid var(--tg-line); padding-top: 16px; }

  .tg-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    color: rgba(255,255,255,0.82);
    font-size: 10px;
    font-weight: 750;
    cursor: pointer;
  }

  .tg-toggle input {
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

  .tg-toggle input::after {
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

  .tg-toggle input:checked { background: var(--tg-accent); }
  .tg-toggle input:checked::after { background: var(--tg-ink); transform: translateX(18px); }
  .tg-toggle input:focus-visible { outline: 2px solid #ffffff; outline-offset: 2px; }

  .tg-export { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; margin-top: 12px; }
  .tg-export button { padding: 10px 4px; }

  .tg-preview {
    position: relative;
    display: flex;
    min-width: 0;
    min-height: 760px;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #080808;
    padding: clamp(54px, 7vw, 96px) clamp(22px, 6vw, 82px);
  }

  .tg-preview-meta {
    position: absolute;
    top: 18px;
    left: 22px;
    display: flex;
    gap: 10px;
    color: rgba(255,255,255,0.32);
    font-size: 8px;
    font-weight: 800;
  }

  .tg-preview-meta strong { color: var(--tg-accent); }

  .tg-artboard {
    position: relative;
    max-width: 100%;
    max-height: 620px;
    height: 620px;
    box-shadow: 0 28px 76px rgba(0,0,0,0.56);
  }

  .tg-svg, .tg-svg svg { display: block; width: 100%; height: 100%; }

  .tg-preview-note {
    position: absolute;
    right: 22px;
    bottom: 18px;
    margin: 0;
    color: rgba(255,255,255,0.3);
    font-size: 8px;
    font-weight: 800;
  }

  @media (max-width: 900px) {
    .tg-root { grid-template-columns: 1fr; }
    .tg-controls { max-height: none; border-right: 0; border-bottom: 1px solid var(--tg-accent); }
    .tg-preview { min-height: min(96vw, 620px); }
    .tg-artboard { height: auto; max-height: 68vh; }
  }

  @media (prefers-reduced-motion: reduce) {
    .tg-root *, .tg-root *::before, .tg-root *::after { transition-duration: 0.01ms !important; }
  }
`;

export default TemplateGenerator;
