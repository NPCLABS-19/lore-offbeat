"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { offbeat, type AssetItem, type Chapter, type MediaItem } from "@/content/offbeat";
import { ShapeGenerator } from "./ShapeGenerator";

const SESSION_KEY = "lore.offbeat.session";
const USERS_KEY = "lore.offbeat.demo-users";
const subscribeToHydration = () => () => undefined;

function ClientFontFaces() {
  const { display, body } = offbeat.theme.fonts;
  return (
    <style>{`
      :root {
        --font-primary: "Helvetica Neue", Helvetica, "${body.family}", Arial, sans-serif;
        --font-social: "${display.family}", "Arial Narrow", sans-serif;
        --font-display: var(--font-primary);
        --font-body: var(--font-primary);
      }
      @font-face { font-family: "${display.family}"; src: url("${display.file}") format("truetype"); font-style: normal; font-weight: 100 900; font-display: swap; }
      @font-face { font-family: "${body.family}"; src: url("${body.regular}") format("opentype"); font-style: normal; font-weight: 400; font-display: swap; }
      @font-face { font-family: "${body.family}"; src: url("${body.bold}") format("opentype"); font-style: normal; font-weight: 700; font-display: swap; }
    `}</style>
  );
}

type IconName = "arrow" | "download" | "copy" | "menu" | "close" | "mail";

function Icon({ name }: { name: IconName }) {
  if (name === "arrow") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M3 10h13M11 5l5 5-5 5" />
      </svg>
    );
  }
  if (name === "download") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <path d="M10 2v11m0 0 4-4m-4 4L6 9M3 16h14" />
      </svg>
    );
  }
  if (name === "copy") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <rect x="7" y="7" width="10" height="10" rx="1" />
        <path d="M13 7V3H3v10h4" />
      </svg>
    );
  }
  if (name === "mail") {
    return (
      <svg aria-hidden="true" viewBox="0 0 20 20">
        <rect x="2" y="4" width="16" height="12" rx="1" />
        <path d="m3 5 7 6 7-6" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20">
      {name === "menu" ? (
        <>
          <path d="M2 5h16M2 10h16M2 15h16" />
        </>
      ) : (
        <path d="M3 3l14 14M17 3 3 17" />
      )}
    </svg>
  );
}

function DemoLogin({ onAuthenticated }: { onAuthenticated: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    try {
      const existing = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as string[];
      if (!existing.includes(email.toLowerCase()) && existing.length >= offbeat.access.maxUsers) {
        setError(`This demo workspace has reached its ${offbeat.access.maxUsers}-user limit.`);
        return;
      }
    } catch {
      // A fresh local demo can continue if storage was manually malformed.
    }
    setSent(true);
  }

  function enter() {
    const normalized = email.trim().toLowerCase();
    let users: string[] = [];
    try {
      users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]") as string[];
    } catch {
      users = [];
    }
    if (!users.includes(normalized)) {
      localStorage.setItem(USERS_KEY, JSON.stringify([...users, normalized]));
    }
    sessionStorage.setItem(SESSION_KEY, normalized);
    onAuthenticated(normalized);
  }

  return (
    <main className="login-shell">
      <div className="login-brand" aria-label="Lore">
        <span className="login-brand-mark">L/</span>
        <span>Lore</span>
      </div>
      <section className="login-stage" aria-labelledby="login-title">
        <div className="login-art" aria-hidden="true">
          <div className="login-art-word">OFF/BEAT</div>
          <div className="login-stairs login-stairs-a" />
          <div className="login-stairs login-stairs-b" />
          <span>Brand systems should move.</span>
        </div>
        <div className="login-panel">
          <p className="eyebrow">Private client space · {offbeat.client.edition}</p>
          {!sent ? (
            <>
              <h1 id="login-title">Enter the living brand book.</h1>
              <p className="login-copy">
                Use your email to access guidelines, approved assets, and design tools for {offbeat.client.name}.
              </p>
              <form onSubmit={submit} noValidate>
                <label htmlFor="email">Work email</label>
                <div className="email-field">
                  <Icon name="mail" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@studio.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-describedby={error ? "login-error" : "login-note"}
                    autoFocus
                  />
                </div>
                {error ? <p className="form-error" id="login-error">{error}</p> : null}
                <button className="button button-dark button-wide" type="submit">
                  Send magic link <Icon name="arrow" />
                </button>
              </form>
              <p className="login-note" id="login-note">
                Prototype access only. No email is sent and no password is stored. Limited to {offbeat.access.maxUsers} local demo users.
              </p>
            </>
          ) : (
            <div className="magic-confirmation" aria-live="polite">
              <span className="magic-icon"><Icon name="mail" /></span>
              <h1 id="login-title">Your link is ready.</h1>
              <p className="login-copy">
                In production, we’ll email a secure, expiring sign-in link to <strong>{email}</strong>.
              </p>
              <button className="button button-dark button-wide" type="button" onClick={enter}>
                Open guidelines <Icon name="arrow" />
              </button>
              <button className="text-button" type="button" onClick={() => setSent(false)}>
                Use another email
              </button>
            </div>
          )}
        </div>
      </section>
      <p className="login-footer">Powered by Lore · Built for independent brand stewards</p>
    </main>
  );
}

function ChapterDirectory({ chapter }: { chapter: Chapter }) {
  return (
    <section className="chapter-directory" id={chapter.slug} aria-labelledby={`${chapter.slug}-title`}>
      <div className="directory-topline">
        <span>Chapter {chapter.number}</span>
        <span>{chapter.status === "placeholder" ? "Material pending" : offbeat.client.name}</span>
      </div>
      <div className="directory-grid">
        <div>
          <span className="chapter-number" aria-hidden="true">{chapter.number}</span>
          <h2 id={`${chapter.slug}-title`}>{chapter.title}</h2>
          {chapter.status === "placeholder" ? (
            <span className="pending-pill">Placeholder chapter</span>
          ) : null}
        </div>
        <div className="directory-list" aria-label={`${chapter.title} sections`}>
          {chapter.sections.map((section, index) => (
            <div key={section}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{section}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="directory-summary">{chapter.summary}</p>
    </section>
  );
}

function SectionHeading({ index, title, children }: { index: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="section-heading">
      <div className="section-label"><span>{index}</span><span>{title}</span></div>
      {children ? <p>{children}</p> : null}
    </header>
  );
}

function AssetCard({ asset }: { asset: AssetItem }) {
  return (
    <article className={`asset-card asset-${asset.surface || "light"}`}>
      <div className="asset-preview">
        <Image src={asset.preview} alt={`${asset.name} preview`} width={760} height={360} unoptimized />
      </div>
      <div className="asset-meta">
        <div>
          <h4>{asset.name}</h4>
          <p>{asset.description}</p>
        </div>
        <a className="icon-button" href={asset.download} download aria-label={`Download ${asset.name} as ${asset.format}`}>
          <span>{asset.format}</span><Icon name="download" />
        </a>
      </div>
    </article>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const dimensions = item.orientation === "landscape"
    ? { width: 1800, height: 1013 }
    : item.orientation === "square"
      ? { width: 1440, height: 1440 }
      : { width: 1440, height: 1800 };

  return (
    <article className={`media-card media-${item.orientation}`}>
      <Image src={item.src} alt={item.alt} {...dimensions} unoptimized />
      <div className="media-card-meta">
        <span>{item.name}</span>
        <a href={item.src} download aria-label={`Download ${item.name} as ${item.format}`}>
          {item.format} <Icon name="download" />
        </a>
      </div>
    </article>
  );
}

function MotionCard({ item }: { item: MediaItem }) {
  if (item.format !== "MP4") return <MediaCard item={item} />;
  return (
    <article className="media-card media-square motion-card">
      <video autoPlay loop muted playsInline preload="metadata" aria-label={item.alt}>
        <source src={item.src} type="video/mp4" />
      </video>
      <div className="media-card-meta">
        <span>{item.name}</span>
        <a href={item.src} download aria-label={`Download ${item.name} as MP4`}>MP4 <Icon name="download" /></a>
      </div>
    </article>
  );
}

function LogoChapter() {
  const chapter = offbeat.chapters[0];
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section">
        <SectionHeading index="01.1" title="Primary identifier">
          {offbeat.guidelines.logo.primary}
        </SectionHeading>
        <div className="hero-art hero-art-pink">
          <Image src="/offbeat/assets/cover-logo.svg" alt="OFF/BEAT primary logo" width={1100} height={420} priority unoptimized />
        </div>
        <div className="rule-grid">
          {offbeat.guidelines.logo.sizing.map((rule) => (
            <div key={`${rule.label}-${rule.value}`}><span>{rule.label}</span><strong>{rule.value}</strong><p>{rule.note}</p></div>
          ))}
        </div>
      </section>

      <section className="content-section lilac-section">
        <SectionHeading index="01.2" title="Construction">
          {offbeat.guidelines.logo.construction}
        </SectionHeading>
        <div className="diagram-card">
          <Image src="/offbeat/assets/logo-construction.svg" alt="Diagram showing construction of the OFF/BEAT logo" width={1100} height={560} unoptimized />
        </div>
      </section>

      <section className="content-section ink-section">
        <SectionHeading index="01.3" title="Contrast and color">
          {offbeat.guidelines.logo.contrast}
        </SectionHeading>
        <div className="logo-color-grid">
          <div className="logo-field pink-field"><Image src="/offbeat/assets/logo-primary.svg" alt="Black logo on signal pink" width={680} height={230} unoptimized /></div>
          <div className="logo-field lilac-field"><Image src="/offbeat/assets/logo-primary.svg" alt="Black logo on soft lilac" width={680} height={230} unoptimized /></div>
          <div className="logo-field cream-field"><Image src="/offbeat/assets/logo-primary.svg" alt="Black logo on warm cream" width={680} height={230} unoptimized /></div>
          <div className="logo-field black-field"><Image src="/offbeat/assets/logo-knockout.svg" alt="Knockout logo on black" width={680} height={230} unoptimized /></div>
        </div>
      </section>

      <section className="content-section cream-section">
        <SectionHeading index="01.4" title="Clearspace">
          {offbeat.guidelines.logo.clearspace}
        </SectionHeading>
        <div className="diagram-card compact-diagram">
          <Image src="/offbeat/assets/logo-clearspace.svg" alt="OFF/BEAT logo clearspace diagram" width={960} height={540} unoptimized />
        </div>
      </section>

      <section className="content-section asset-section">
        <SectionHeading index="01.5" title="Approved logo files">
          {offbeat.guidelines.logo.assets}
        </SectionHeading>
        <div className="asset-grid">
          {offbeat.assets.map((asset) => <AssetCard asset={asset} key={asset.name} />)}
        </div>
      </section>

      <section className="content-section cream-section">
        <SectionHeading index="01.6" title="Round one explorations">
          Selected working studies from the original OFF/BEAT exploration deck.
        </SectionHeading>
        <div className="media-grid media-grid-landscape">
          {offbeat.media.logoExplorations.map((item) => <MediaCard item={item} key={item.src} />)}
        </div>
      </section>

      <section className="content-section ink-section">
        <SectionHeading index="01.7" title="Logo in motion">
          Short motion studies for digital signatures, reveals, and transitions.
        </SectionHeading>
        <div className="media-grid motion-grid">
          {offbeat.media.motion.map((item) => <MotionCard item={item} key={item.src} />)}
        </div>
      </section>

      <section className="content-section asset-section">
        <SectionHeading index="01.8" title="Production exports">
          Downloadable logo outputs supplied with the production archive.
        </SectionHeading>
        <div className="media-grid logo-export-grid">
          {offbeat.media.logoExports.map((item) => <MediaCard item={item} key={item.src} />)}
        </div>
      </section>

      <section className="content-section dont-section">
        <SectionHeading index="01.9" title="Keep the beat">
          {offbeat.guidelines.logo.consistency}
        </SectionHeading>
        <div className="dont-grid">
          {offbeat.guidelines.logo.donts.map(({ label, glyph }) => (
            <div key={label}><span>{glyph}</span><p>{label}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}

function PhotographyChapter() {
  const chapter = offbeat.chapters[3];
  const references = [3, 4, 6, 7, 9, 12].map((index) => offbeat.media.social[index]);
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section">
        <SectionHeading index="04.1" title="Image direction">
          Build from decisive crops, recognisable references, controlled grain, and one graphic intervention.
        </SectionHeading>
        <div className="media-grid social-media-grid photography-media-grid">
          {references.map((item) => <MediaCard item={item} key={item.src} />)}
        </div>
      </section>
    </>
  );
}

function ApplicationChapter() {
  const chapter = offbeat.chapters[5];
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section">
        <SectionHeading index="06.1" title="Application explorations">
          Environmental, editorial, merchandise, and object studies from round one.
        </SectionHeading>
        <div className="media-grid media-grid-landscape">
          {offbeat.media.applications.map((item) => <MediaCard item={item} key={item.src} />)}
        </div>
      </section>
      <section className="content-section ink-section">
        <SectionHeading index="06.2" title="Social media design">
          Published and exploratory social formats across announcements, reports, partnerships, and programmes.
        </SectionHeading>
        <div className="media-grid social-media-grid">
          {offbeat.media.social.map((item) => <MediaCard item={item} key={item.src} />)}
        </div>
      </section>
    </>
  );
}

function TypeTester() {
  const [text, setText] = useState("Clear ideas, carefully expressed.");
  const [size, setSize] = useState(64);
  const [weight, setWeight] = useState(500);
  return (
    <div className="type-tester">
      <div className="tester-controls">
        <label>
          <span>Size <output>{size}px</output></span>
          <input aria-label="Type size" type="range" min="34" max="160" value={size} onChange={(e) => setSize(Number(e.target.value))} />
        </label>
        <label>
          <span>Weight <output>{weight}</output></span>
          <input aria-label="Type weight" type="range" min="400" max="700" step="100" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
        </label>
      </div>
      <textarea
        aria-label="Type tester text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        style={{ fontSize: `clamp(2.25rem, ${size / 13}vw, ${size}px)`, fontWeight: weight }}
      />
      <div className="tester-foot"><span>Helvetica / Nimbus Sans</span><span>Type here to test</span></div>
    </div>
  );
}

function TypographyChapter() {
  const chapter = offbeat.chapters[1];
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section type-intro">
        <SectionHeading index="02.1" title="Primary typeface">
          {offbeat.guidelines.typography.primary}
        </SectionHeading>
        <div className="primary-type-specimen" aria-label="Helvetica and Nimbus Sans type specimen">
          <div className="type-specimen-meta">
            <span>Nimbus Sans Medium</span>
            <span>Helvetica Medium</span>
            <span>Primary brand voice</span>
          </div>
          <div className="type-specimen-characters">
            <strong>Helvetica / Nimbus Sans</strong>
            <span>ABCDEFGHIJKLMNOPQRSTUVWXYZ</span>
            <span>abcdefghijklmnopqrstuvwxyz</span>
            <span>0123456789 .,&amp;?!$</span>
          </div>
        </div>
        <div className="type-details"><span>Medium for hierarchy</span><span>Regular for reading</span><span>Sentence case preferred</span></div>
      </section>

      <section className="content-section pink-section social-type-section">
        <SectionHeading index="02.2" title="Social headlines only">
          {offbeat.guidelines.typography.supporting}
        </SectionHeading>
        <div className="type-hero social-type" aria-label="Archivo social headline specimen">
          <span>LOUD IDEAS</span>
          <span>CLEAR SIGNAL</span>
        </div>
        <div className="type-details"><span>Archivo Narrow</span><span>Social and campaign headlines</span><span>Never typeset OFF/BEAT</span></div>
      </section>

      <section className="content-section lilac-section">
        <SectionHeading index="02.3" title="Hierarchy">
          {offbeat.guidelines.typography.hierarchy}
        </SectionHeading>
        <div className="hierarchy-stack">
          <div className="hierarchy-row"><span>Headline · Medium</span><strong>One clear thought earns attention.</strong></div>
          <div className="hierarchy-row social-hierarchy-row"><span>Social headline · Archivo</span><h3>LOUD IDEAS / CLEAR SIGNAL</h3></div>
          <div className="hierarchy-row"><span>Body · 15/21</span><p>{offbeat.guidelines.typography.hierarchyBody}</p></div>
        </div>
      </section>

      <section className="content-section ink-section">
        <SectionHeading index="02.4" title="Type tester">
          {offbeat.guidelines.typography.tester}
        </SectionHeading>
        <TypeTester />
      </section>

      <section className="content-section asset-section font-downloads">
        <SectionHeading index="02.5" title="Font files">
          {offbeat.guidelines.typography.downloads}
        </SectionHeading>
        <div className="download-list">
          {offbeat.fontDownloads.map((font, index) => (
            <a href={font.path} download key={font.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{font.name}</strong>
              <span>{font.format}</span>
              <Icon name="download" />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

function ColorChapter({ onCopy }: { onCopy: (value: string) => void }) {
  const chapter = offbeat.chapters[2];
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section">
        <SectionHeading index="03.1" title="Palette">
          {offbeat.guidelines.color.palette}
        </SectionHeading>
        <div className="swatch-grid">
          {offbeat.palette.map((color, index) => (
            <button
              className="swatch"
              type="button"
              key={color.hex}
              style={{ background: color.hex, color: color.text } as CSSProperties}
              onClick={() => onCopy(color.hex)}
              aria-label={`Copy ${color.name} ${color.hex}`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span className="swatch-name">{color.name}</span>
              <span>{color.hex} <Icon name="copy" /></span>
              <small>{color.role}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="content-section ink-section">
        <SectionHeading index="03.2" title="Proportion">
          {offbeat.guidelines.color.proportion}
        </SectionHeading>
        <div className="color-proportion" aria-label="Recommended color proportion">
          <div style={{ flex: 42, background: "#D1CDD2" }}><span>42%</span></div>
          <div style={{ flex: 28, background: "#000000", color: "#fff" }}><span>28%</span></div>
          <div style={{ flex: 18, background: "#FFEFE9" }}><span>18%</span></div>
          <div style={{ flex: 12, background: "#FF00B4" }}><span>12%</span></div>
        </div>
      </section>

      <section className="content-section lilac-section">
        <SectionHeading index="03.3" title="Combinations">
          {offbeat.guidelines.color.combinations}
        </SectionHeading>
        <div className="combination-grid">
          <div className="combo combo-pink"><span>HIGH</span><strong>ENERGY</strong></div>
          <div className="combo combo-green"><span>GOOD</span><strong>SIGNAL</strong></div>
          <div className="combo combo-rust"><span>WARM</span><strong>VOLUME</strong></div>
          <div className="combo combo-cream"><span>CALM</span><strong>GROUND</strong></div>
        </div>
      </section>
    </>
  );
}

function SystemChapter() {
  const chapter = offbeat.chapters[4];
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section pink-section">
        <SectionHeading index="05.1" title="Shape language">
          {offbeat.guidelines.system.shape}
        </SectionHeading>
        <div className="shape-showcase">
          <Image src="/offbeat/assets/shape-grid.svg" alt="Four warm-white stepped blocks around the words Custom patterns" width={1000} height={563} unoptimized />
          <a className="shape-download" href="/offbeat/assets/shape-grid.svg" download>Download composition <Icon name="download" /></a>
        </div>
        <div className="system-principles">
          {offbeat.guidelines.system.principles.map((principle) => (
            <div key={principle.number}><span>{principle.number}</span><strong>{principle.title}</strong><p>{principle.note}</p></div>
          ))}
        </div>
      </section>
      <section className="tool-section" id="shape-generator">
        <div className="tool-banner"><span>{offbeat.theme.banners.app}</span><span>05.2</span></div>
        <header className="tool-heading">
          <div><p className="eyebrow">Lore app · 01</p><h3>Shape Generator</h3></div>
          <p>{offbeat.guidelines.system.tool}</p>
        </header>
        <ShapeGenerator />
      </section>
    </>
  );
}

function BookHeader({ onMenu, onLogout, email }: { onMenu: () => void; onLogout: () => void; email: string }) {
  return (
    <header className="book-header">
      <a className="wordmark" href="#top" aria-label="OFF/BEAT brand guidelines home">OFF/BEAT</a>
      <div className="header-center"><span>Brand Guidelines</span><span className="header-edition">{offbeat.client.edition}</span></div>
      <div className="header-actions">
        <a href={offbeat.downloads.pdf} download className="header-download"><span>PDF</span><Icon name="download" /></a>
        <button className="account-button" type="button" onClick={onLogout} title={`Sign out ${email}`} aria-label={`Sign out ${email}`}>{email.slice(0, 1).toUpperCase()}</button>
        <button className="menu-button" type="button" onClick={onMenu} aria-label="Open contents"><span>Index</span><Icon name="menu" /></button>
      </div>
    </header>
  );
}

function Menu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={`menu-overlay ${open ? "menu-open" : ""}`} aria-hidden={!open}>
      <div className="menu-top"><span>OFF/BEAT · Index</span><button type="button" onClick={onClose} aria-label="Close index"><Icon name="close" /></button></div>
      <nav aria-label="Chapter navigation">
        {offbeat.chapters.map((chapter) => (
          <a href={`#${chapter.slug}`} key={chapter.slug} onClick={onClose} tabIndex={open ? 0 : -1}>
            <span>{chapter.number}</span><strong>{chapter.title}</strong>
            {chapter.status === "placeholder" ? <small>Pending</small> : <Icon name="arrow" />}
          </a>
        ))}
      </nav>
      <div className="menu-bottom"><a href="#shape-generator" onClick={onClose}>Open Shape Generator</a><a href={`mailto:${offbeat.client.contact}`}>{offbeat.client.contact}</a></div>
    </div>
  );
}

function BrandBook({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  function copy(value: string) {
    navigator.clipboard?.writeText(value).catch(() => undefined);
    setToast(`${value} copied`);
    window.setTimeout(() => setToast(""), 1800);
  }

  const themeStyle = useMemo(() => ({
    "--ink": offbeat.theme.colors.ink,
    "--paper": offbeat.theme.colors.paper,
    "--pink": offbeat.theme.colors.pink,
    "--lilac": offbeat.theme.colors.lilac,
    "--green": offbeat.theme.colors.green,
    "--rust": offbeat.theme.colors.rust,
    "--olive": offbeat.theme.colors.olive,
    "--cream": offbeat.theme.colors.cream,
    "--khaki": offbeat.theme.colors.khaki,
    "--white": offbeat.theme.colors.white,
    "--cover-bg": offbeat.theme.colors[offbeat.theme.backgrounds.cover],
    "--directory-bg": offbeat.theme.colors[offbeat.theme.backgrounds.directories],
    "--content-bg": offbeat.theme.colors[offbeat.theme.backgrounds.content],
    "--tools-bg": offbeat.theme.colors[offbeat.theme.backgrounds.tools],
  }) as CSSProperties, []);

  return (
    <main className="brand-book" style={themeStyle} id="top">
      <a className="skip-link" href="#contents">Skip to contents</a>
      <BookHeader onMenu={() => setMenuOpen(true)} onLogout={onLogout} email={email} />
      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="prototype-ribbon" role="note"><span>{offbeat.theme.banners.top}</span><span>Owner-managed · demo access</span></div>

      <section className="cover" aria-labelledby="cover-title">
        <div className="cover-meta"><span>{offbeat.client.edition}</span><span>Scroll to explore ↓</span></div>
        <h1 id="cover-title" className="sr-only">OFF/BEAT Brand Guidelines</h1>
        <Image src="/offbeat/assets/cover-logo.svg" alt="OFF/BEAT" width={1200} height={440} priority unoptimized />
        <div className="cover-bottom"><span>Interactive brand book</span><span>Built on Lore</span></div>
      </section>

      <section className="welcome-section">
        <p className="eyebrow">Welcome / Start here</p>
        <p>{offbeat.client.intro}</p>
        <div className="welcome-aside"><span>Use this guide to</span><ul>{offbeat.guidelines.welcomeUses.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      <section className="contents-section" id="contents" aria-labelledby="contents-title">
        <div className="contents-heading"><p className="eyebrow">Directory / 01–06</p><h2 id="contents-title">Contents</h2></div>
        <nav className="contents-list" aria-label="Table of contents">
          {offbeat.chapters.map((chapter) => (
            <a href={`#${chapter.slug}`} key={chapter.slug}>
              <span>{chapter.number}</span><strong>{chapter.title}</strong><small>{chapter.status === "placeholder" ? "Material pending" : `${chapter.sections.length} sections`}</small><Icon name="arrow" />
            </a>
          ))}
        </nav>
        <div className="contents-footer"><p>Questions, approvals, or missing files?</p><a href={`mailto:${offbeat.client.contact}`}>{offbeat.client.contact} <Icon name="arrow" /></a></div>
      </section>

      <LogoChapter />
      <TypographyChapter />
      <ColorChapter onCopy={copy} />
      <PhotographyChapter />
      <SystemChapter />
      <ApplicationChapter />

      <section className="download-book">
        <p className="eyebrow">Take it offline</p>
        <h2>{offbeat.guidelines.offline.title}</h2>
        <p>{offbeat.guidelines.offline.description}</p>
        <a className="button button-pink" href={offbeat.downloads.pdf} download>Download PDF <Icon name="download" /></a>
      </section>

      <footer className="book-footer">
        <div><Image className="footer-logo" src="/offbeat/assets/logo-knockout.svg" alt="OFF/BEAT" width={760} height={232} unoptimized /><span>Brand Guidelines · {offbeat.client.edition}</span></div>
        <div><span>Maintained in Lore</span><a href={`mailto:${offbeat.client.contact}`}>{offbeat.client.contact}</a></div>
        <a href="#top">Back to top ↑</a>
      </footer>
      {toast ? <div className="toast" role="status">{toast}</div> : null}
    </main>
  );
}

export function LoreBook() {
  const [email, setEmail] = useState<string | null>(() =>
    typeof window === "undefined" ? null : sessionStorage.getItem(SESSION_KEY),
  );
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);

  if (!hydrated) return <><ClientFontFaces /><main className="loading-screen"><span>LORE / OFF/BEAT</span></main></>;
  if (!email) return <><ClientFontFaces /><DemoLogin onAuthenticated={setEmail} /></>;
  return <><ClientFontFaces /><BrandBook email={email} onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setEmail(null); }} /></>;
}
