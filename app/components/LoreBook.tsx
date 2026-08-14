"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  offbeat,
  type AssetItem,
  type Chapter,
  type GuidelineReference,
  type InspirationItem,
  type MediaItem,
  type TasteReference,
} from "@/content/offbeat";
import { steppedClipPath, steppedSvgPath } from "@/app/lib/steppedShape";
import { ShapeGenerator } from "./ShapeGenerator";
import { TemplateGenerator } from "./TemplateGenerator";

const SESSION_KEY = "lore.offbeat.session";

function scrollToBookSection(rawHash: string) {
  const id = decodeURIComponent(rawHash.replace(/^#/, ""));
  const target = document.getElementById(id);
  if (!target) return false;

  const headerHeight = document.querySelector<HTMLElement>(".book-header")?.getBoundingClientRect().height ?? 58;
  const top = id === "top"
    ? 0
    : target.getBoundingClientRect().top + window.scrollY - headerHeight - 30;

  window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
  return true;
}
const USERS_KEY = "lore.offbeat.demo-users";
const subscribeToHydration = () => () => undefined;

const chapterBySlug = (slug: string): Chapter =>
  offbeat.chapters.find((chapter) => chapter.slug === slug) as Chapter;

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
  const natural = item.width && item.height;
  const dimensions = natural
    ? { width: item.width, height: item.height }
    : item.orientation === "landscape"
      ? { width: 1800, height: 1013 }
      : item.orientation === "square"
        ? { width: 1440, height: 1440 }
        : { width: 1440, height: 1800 };

  return (
    <article className={`media-card media-${item.orientation}${natural ? " media-natural" : ""}`}>
      <Image src={item.src} alt={item.alt} {...dimensions} unoptimized />
      <div className="media-card-meta">
        <div className="media-card-title">
          {item.note ? <small>{item.note}</small> : null}
          <span>{item.name}</span>
        </div>
        <a href={item.src} download aria-label={`Download ${item.name} as ${item.format}`}>
          {item.format} <Icon name="download" />
        </a>
      </div>
    </article>
  );
}

function SilhouetteGlyph({ cut, steps }: { cut: number; steps: number }) {
  return (
    <svg className="silhouette-glyph" viewBox="0 0 100 100" aria-hidden="true">
      <path d={steppedSvgPath({ cut, steps })} />
    </svg>
  );
}

function SteppedFigure({ item, masked = true }: { item: InspirationItem; masked?: boolean }) {
  return (
    <figure className="stepped-figure">
      <div className="stepped-mask" style={masked ? { clipPath: steppedClipPath(item) } : undefined}>
        <Image src={item.src} alt={item.alt} width={item.width ?? 1200} height={item.height ?? 1200} unoptimized />
      </div>
      <figcaption>
        <div>
          <small>{item.credit}</small>
          <span>{item.name}</span>
        </div>
        {masked ? (
          <span className="stepped-spec">
            {item.steps} step{item.steps === 1 ? "" : "s"} · φ {item.cut.toFixed(3)}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

function EvidenceFigure({ item, tone = "light" }: { item: GuidelineReference; tone?: "light" | "dark" }) {
  return (
    <figure className={`evidence-figure evidence-${tone}`}>
      <Image src={item.src} alt={item.alt} width={item.width ?? 1200} height={item.height ?? 1200} unoptimized />
      <figcaption>
        <div className="evidence-title"><small>What this demonstrates</small><strong>{item.name}</strong></div>
        <p>{item.demonstrates}</p>
        <p><b>Preferred use</b>{item.preferred}</p>
        {item.avoid ? <p><b>Avoid</b>{item.avoid}</p> : null}
        <a href={item.src} download aria-label={`Download ${item.name} as ${item.format}`}>{item.format} <Icon name="download" /></a>
      </figcaption>
    </figure>
  );
}

function TasteReferenceCard({ item }: { item: TasteReference }) {
  return (
    <a className="taste-reference-card" href={item.sourceUrl} target="_blank" rel="noreferrer">
      <Image src={item.src} alt={item.alt} width={736} height={920} unoptimized />
      <span><small>Taste reference only</small><strong>{item.title}</strong><Icon name="arrow" /></span>
    </a>
  );
}

function TasteBoard({ items, boardUrl, label }: { items: readonly TasteReference[]; boardUrl: string; label: string }) {
  const featured = items.filter((item) => item.featured);
  const remaining = items.filter((item) => !item.featured);
  return (
    <div className="taste-board">
      <div className="taste-reference-grid">
        {featured.map((item) => <TasteReferenceCard item={item} key={item.sourceUrl} />)}
      </div>
      <details className="taste-more">
        <summary>View all {items.length} references <Icon name="arrow" /></summary>
        <div className="taste-reference-grid taste-reference-grid-all">
          {remaining.map((item) => <TasteReferenceCard item={item} key={item.sourceUrl} />)}
        </div>
      </details>
      <a className="board-link" href={boardUrl} target="_blank" rel="noreferrer">Open the full {label} Pinterest board <Icon name="arrow" /></a>
    </div>
  );
}

function MotionCard({ item }: { item: MediaItem }) {
  if (item.format !== "MP4") return <MediaCard item={item} />;
  const aspect = item.width && item.height ? { aspectRatio: `${item.width} / ${item.height}` } : undefined;
  return (
    <article className={`media-card media-${item.orientation} motion-card`}>
      <video autoPlay loop muted playsInline preload="metadata" aria-label={item.alt} style={aspect}>
        <source src={item.src} type="video/mp4" />
      </video>
      <div className="media-card-meta">
        <div className="media-card-title">
          {item.note ? <small>{item.note}</small> : null}
          <span>{item.name}</span>
        </div>
        <a href={item.src} download aria-label={`Download ${item.name} as MP4`}>MP4 <Icon name="download" /></a>
      </div>
    </article>
  );
}

function LogoChapter() {
  const chapter = chapterBySlug("logo");
  const references = offbeat.media.guidelineReferences;
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.1`} title="Logo family">
          {offbeat.guidelines.logo.primary}
        </SectionHeading>
        <div className="logo-family-grid">
          <div className="logo-family-primary">
            <span>Primary badge</span>
            <Image src="/offbeat/assets/cover-logo.svg" alt="OFF/BEAT primary badge" width={1100} height={420} priority unoptimized />
          </div>
          <div className="logo-family-alternate">
            <span>Alternate lockup</span>
            <Image src="/offbeat/assets/logo-alternate-lockup.png" alt="Alternate OFF/BEAT bracketed lockup" width={4390} height={1196} unoptimized />
          </div>
        </div>
        <div className="role-grid">
          {offbeat.guidelines.logo.roles.map((role, index) => (
            <div key={role.title}><span>{String(index + 1).padStart(2, "0")}</span><strong>{role.title}</strong><p>{role.note}</p></div>
          ))}
        </div>
        <div className="rule-grid">
          {offbeat.guidelines.logo.sizing.map((rule) => (
            <div key={`${rule.label}-${rule.value}`}><span>{rule.label}</span><strong>{rule.value}</strong><p>{rule.note}</p></div>
          ))}
        </div>
        <div className="sizing-rule">
          <div className="sizing-rule-mark">
            <Image
              src="/offbeat/assets/logo-alternate-lockup.png"
              alt="Alternate OFF/BEAT bracketed lockup, used below one inch"
              width={4390}
              height={1196}
              unoptimized
            />
          </div>
          <p>{offbeat.guidelines.logo.sizingRule}</p>
        </div>
      </section>

      <section className="content-section ink-section">
        <SectionHeading index={`${chapter.number}.2`} title="Colour and contrast">
          {offbeat.guidelines.logo.contrast}
        </SectionHeading>
        <div className="logo-color-grid logo-color-grid-primary">
          <div className="logo-field pink-field"><Image src="/offbeat/assets/logo-primary.svg" alt="Primary black logo on Signal Pink" width={680} height={230} unoptimized /><span>Signal Pink / black</span></div>
          <div className="logo-field black-field"><Image src="/offbeat/assets/logo-knockout.svg" alt="Primary off-white logo on black" width={680} height={230} unoptimized /><span>Black / off-white</span></div>
          <div className="logo-field cream-field"><Image src="/offbeat/assets/logo-primary.svg" alt="Primary black logo on warm off-white" width={680} height={230} unoptimized /><span>Off-white / black</span></div>
        </div>
        <div className="secondary-logo-note"><strong>Secondary lockups</strong><p>Supporting versions may use the wider approved palette, provided the wordmark remains immediately legible.</p></div>
        <EvidenceFigure item={references.multilingual} tone="dark" />
      </section>

      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.3`} title="Placement">
          {offbeat.guidelines.logo.placement}
        </SectionHeading>
        <div className="placement-rules">
          <div><span>Preferred</span><strong>Top-middle</strong><p>Use when the logo opens or signs a vertically led layout.</p></div>
          <div><span>Preferred</span><strong>Centre axis</strong><p>Use when the logo is the signature or final read.</p></div>
          <div className="placement-avoid"><span>Avoid</span><strong>Sides and corners</strong><p>The logo is not a navigation badge or corner stamp.</p></div>
        </div>
        <EvidenceFigure item={references.billboardLogo} />
      </section>

      <section className="content-section lilac-section">
        <SectionHeading index={`${chapter.number}.4`} title="Stroked logo">
          {offbeat.guidelines.logo.stroke}
        </SectionHeading>
        <div className="stroke-use-grid">
          <div><span>Negative fill</span><strong>Background depth</strong><p>Use as pattern or atmosphere. It should not become the subject.</p></div>
          <div><span>Filled + stroke</span><strong>Creative applications</strong><p>Use on objects, posters, lightboxes, keychains, and merchandise.</p></div>
          <div><span>Formal communication</span><strong>Never</strong><p>Use the primary or alternate identifier instead.</p></div>
        </div>
        <EvidenceFigure item={references.strokedLogo} />
      </section>

      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.5`} title="Construction and clearspace">
          {offbeat.guidelines.logo.construction} {offbeat.guidelines.logo.clearspace}
        </SectionHeading>
        <div className="construction-pair">
          <div className="diagram-card"><Image src="/offbeat/assets/logo-construction.svg" alt="Diagram showing construction of the OFF/BEAT logo" width={1100} height={560} unoptimized /></div>
          <div className="diagram-card"><Image src="/offbeat/assets/logo-clearspace.svg" alt="OFF/BEAT logo clearspace diagram" width={960} height={540} unoptimized /></div>
        </div>
      </section>

      <section className="content-section asset-section">
        <SectionHeading index={`${chapter.number}.6`} title="Approved logo files">
          {offbeat.guidelines.logo.assets}
        </SectionHeading>
        <div className="asset-grid">
          {offbeat.assets.map((asset) => <AssetCard asset={asset} key={asset.name} />)}
        </div>
      </section>

      <section className="content-section ink-section">
        <SectionHeading index={`${chapter.number}.7`} title="Logo in motion">
          The reveal, the signature loop, and one example in use.
        </SectionHeading>
        <div className="motion-row">
          {offbeat.media.showcase.motion.map((item) => <MotionCard item={item} key={item.src} />)}
        </div>
      </section>

      <section className="content-section dont-section">
        <SectionHeading index={`${chapter.number}.8`} title="Keep recognition">
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
  const chapter = chapterBySlug("photography");
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.1`} title="Image direction">
          Build from decisive crops, recognisable references, controlled grain, and one graphic intervention.
        </SectionHeading>
        <div className="photo-principles">
          {offbeat.media.photography.map((principle) => (
            <div className="photo-principle" key={principle.number}>
              <div className="photo-principle-text">
                <span>{principle.number}</span>
                <h3>{principle.title}</h3>
                <p>{principle.note}</p>
                {principle.rule ? <p className="howto-rule">{principle.rule}</p> : null}
              </div>
              <MediaCard item={principle.item} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ApplicationChapter() {
  const chapter = chapterBySlug("application");
  const references = offbeat.media.guidelineReferences;
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.1`} title="Layout hierarchy">
          Let context decide the hierarchy. The logo is a signature, not an automatic headline.
        </SectionHeading>
        <div className="layout-hierarchy-grid">
          <div><span>Announcement</span><strong>Type → colour → logo</strong><p>The idea leads. Add the logo only as a signature.</p></div>
          <div><span>Owned social</span><strong>No logo by default</strong><p>The publishing handle already establishes authorship.</p></div>
          <div><span>Collaboration or video</span><strong>Centred signature</strong><p>Use the logo for collaborations, purposeful overlays, and end slates.</p></div>
        </div>
        <div className="evidence-pair">
          <EvidenceFigure item={references.businessGuide} />
          <EvidenceFigure item={references.billboardType} />
        </div>
      </section>

      <section className="content-section lilac-section">
        <SectionHeading index={`${chapter.number}.2`} title="Physical applications">
          Let material, object, and environment do some of the branding work.
        </SectionHeading>
        <div className="evidence-pair">
          <EvidenceFigure item={references.bandana} />
          <EvidenceFigure item={references.keyAd} />
        </div>
      </section>

      <section className="content-section ink-section">
        <SectionHeading index={`${chapter.number}.3`} title="Published formats">
          Use the system differently for apparel, collaboration, environmental, and owned-channel work.
        </SectionHeading>
        <div className="application-case-stack">
          <EvidenceFigure item={references.onDuty} tone="dark" />
          <EvidenceFigure item={references.billboardLogo} tone="dark" />
          <EvidenceFigure item={references.environmentalPattern} tone="dark" />
        </div>
      </section>
    </>
  );
}

function ArchiveSection() {
  return (
    <section className="archive-section" id="archive" aria-labelledby="archive-title">
      <div className="archive-heading">
        <p className="eyebrow">Source library</p>
        <h2 id="archive-title">Archive</h2>
        <p>Every supplied source file, available to download. The pages above show the curated selection.</p>
      </div>
      {offbeat.media.archive.map((group) => (
        <div className="archive-group" key={group.title}>
          <div className="archive-group-head">
            <h3>{group.title}</h3>
            <p>{group.note}</p>
          </div>
          <div className="archive-list">
            {group.entries.map((entry) => (
              <a href={entry.src} download key={entry.src} aria-label={`Download ${entry.name} as ${entry.format}`}>
                <strong>{entry.name}</strong>
                <span>{entry.dimensions}</span>
                <span>{entry.format}</span>
                <Icon name="download" />
              </a>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function TypeTester() {
  const [text, setText] = useState("Clear ideas, carefully expressed.");
  const [size, setSize] = useState(64);
  const [weight, setWeight] = useState(500);
  const [font, setFont] = useState<"primary" | "social">("primary");
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
        <div className="tester-fonts" role="group" aria-label="Typeface">
          <span>Typeface</span>
          <div>
            <button type="button" aria-pressed={font === "primary"} onClick={() => setFont("primary")}>
              Helvetica / Nimbus
            </button>
            <button type="button" aria-pressed={font === "social"} onClick={() => setFont("social")}>
              Archivo Narrow
            </button>
          </div>
        </div>
      </div>
      <textarea
        aria-label="Type tester text"
        className={font === "social" ? "tester-social" : undefined}
        value={text}
        onChange={(event) => setText(event.target.value)}
        style={{ fontSize: `clamp(2.25rem, ${size / 13}vw, ${size}px)`, fontWeight: weight }}
      />
      <div className="tester-foot">
        <span>{font === "social" ? "Archivo Narrow · social headlines only" : "Helvetica / Nimbus Sans"}</span>
        <span>Type here to test</span>
      </div>
    </div>
  );
}

function TypographyChapter() {
  const chapter = chapterBySlug("typography");
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section type-intro">
        <SectionHeading index={`${chapter.number}.1`} title="Primary typeface">
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
        <SectionHeading index={`${chapter.number}.2`} title="Social headlines only">
          {offbeat.guidelines.typography.supporting}
        </SectionHeading>
        <div className="type-hero social-type" aria-label="Archivo social headline specimen">
          <span>LOUD IDEAS</span>
          <span>CLEAR SIGNAL</span>
        </div>
        <div className="type-details"><span>Archivo Narrow</span><span>Social and campaign headlines</span><span>Never typeset OFF/BEAT</span></div>
      </section>

      <section className="content-section lilac-section">
        <SectionHeading index={`${chapter.number}.3`} title="Hierarchy">
          {offbeat.guidelines.typography.hierarchy}
        </SectionHeading>
        <div className="hierarchy-stack">
          <div className="hierarchy-row"><span>Headline · Medium</span><strong>One clear thought earns attention.</strong></div>
          <div className="hierarchy-row social-hierarchy-row"><span>Social headline · Archivo</span><h3>LOUD IDEAS / CLEAR SIGNAL</h3></div>
          <div className="hierarchy-row"><span>Body · 15/21</span><p>{offbeat.guidelines.typography.hierarchyBody}</p></div>
        </div>
      </section>

      <section className="content-section ink-section">
        <SectionHeading index={`${chapter.number}.4`} title="Type tester">
          {offbeat.guidelines.typography.tester}
        </SectionHeading>
        <TypeTester />
      </section>

      <section className="content-section asset-section font-downloads">
        <SectionHeading index={`${chapter.number}.5`} title="Font files">
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
  const chapter = chapterBySlug("color");
  const primaryNames = new Set(["Signal Pink", "Ink", "Warm Cream"]);
  const primary = offbeat.palette.filter((color) => primaryNames.has(color.name));
  const supporting = offbeat.palette.filter((color) => !primaryNames.has(color.name));
  const references = offbeat.media.guidelineReferences;
  const renderSwatches = (colors: typeof offbeat.palette) => colors.map((color, index) => (
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
  ));
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.1`} title="Palette">
          {offbeat.guidelines.color.palette}
        </SectionHeading>
        <div className="palette-group"><h3>Core</h3><div className="swatch-grid swatch-grid-core">{renderSwatches(primary)}</div></div>
        <div className="palette-group"><h3>Supporting</h3><div className="swatch-grid swatch-grid-supporting">{renderSwatches(supporting)}</div></div>
      </section>

      <section className="content-section ink-section">
        <SectionHeading index={`${chapter.number}.2`} title="Logo colours">
          The primary identifier stays pink, black, or off-white. Secondary lockups may move through the supporting palette when contrast remains clear.
        </SectionHeading>
        <div className="logo-colour-matrix">
          <div className="pink-field"><Image src="/offbeat/assets/logo-primary.svg" alt="Primary black logo on Signal Pink" width={680} height={230} unoptimized /><span>Primary · approved</span></div>
          <div className="black-field"><Image src="/offbeat/assets/logo-knockout.svg" alt="Primary off-white logo on black" width={680} height={230} unoptimized /><span>Primary · approved</span></div>
          <div className="cream-field"><Image src="/offbeat/assets/logo-primary.svg" alt="Primary black logo on off-white" width={680} height={230} unoptimized /><span>Primary · approved</span></div>
        </div>
      </section>

      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.3`} title="Two or three colours">
          {offbeat.guidelines.color.proportion}
        </SectionHeading>
        <div className="colour-preferences">
          <div><span>01</span><strong>One lead colour</strong><p>Give the composition one unmistakable field or material.</p></div>
          <div><span>02</span><strong>One structural colour</strong><p>Use it for type, contrast, or the main image relationship.</p></div>
          <div><span>03</span><strong>One signal, if needed</strong><p>A small third colour should make a deliberate point.</p></div>
        </div>
        <EvidenceFigure item={references.businessGuide} />
      </section>

      <section className="content-section lilac-section">
        <SectionHeading index={`${chapter.number}.4`} title="Pink cadence">
          {offbeat.guidelines.color.combinations}
        </SectionHeading>
        <p className="chapter-statement">{offbeat.guidelines.color.cadence}</p>
        <div className="evidence-pair">
          <EvidenceFigure item={references.pinkLighter} />
          <EvidenceFigure item={references.bandana} />
        </div>
      </section>

      <section className="content-section ink-section">
        <SectionHeading index={`${chapter.number}.5`} title="Gradients">
          {offbeat.guidelines.color.gradient}
        </SectionHeading>
        <div className="gradient-ratio" aria-label="Preferred gradient balance, 61.8 percent lead and 38.2 percent support">
          <div><strong>61.8</strong><span>Lead colour</span></div><div><strong>38.2</strong><span>Support colour</span></div>
        </div>
        <EvidenceFigure item={references.keyAd} tone="dark" />
      </section>
    </>
  );
}

function SystemChapter() {
  const chapter = chapterBySlug("system");
  const references = offbeat.media.guidelineReferences;
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.1`} title="Brand signals">
          {offbeat.guidelines.system.overview}
        </SectionHeading>
        <div className="brand-signal-grid">
          <div><span>01</span><strong>Loud typography</strong><p>Lead with the idea and give it room.</p></div>
          <div className="signal-pink"><span>02</span><strong>Signal Pink</strong><p>Use it as a punch, not an obligation.</p></div>
          <div><span>03</span><strong>Slash</strong><p>Use it when it completes the language.</p></div>
          <div><span>04</span><strong>Brackets</strong><p>Frame content, collaboration, or a reveal.</p></div>
          <div><span>05</span><strong>Step cuts</strong><p>Use selectively at scales where they read.</p></div>
        </div>
      </section>

      <section className="content-section lilac-section">
        <SectionHeading index={`${chapter.number}.2`} title="Containers">
          {offbeat.guidelines.system.concept}
        </SectionHeading>
        <div className="container-rules">
          <div><span>Filled</span><strong>Creative subject</strong><p>Type plates, physical objects, posters, and large-format interventions.</p></div>
          <div><span>Negative fill</span><strong>Depth and atmosphere</strong><p>Outlined frames sit behind the subject and create rhythm.</p></div>
          <div><span>Stroke</span><strong>3px preferred</strong><p>Never below 2px on a 1080px canvas; scale proportionally.</p></div>
        </div>
        <EvidenceFigure item={references.patternMaster} />
      </section>

      <section className="content-section ink-section">
        <SectionHeading index={`${chapter.number}.3`} title="Slash and brackets">
          {offbeat.guidelines.system.repeat}
        </SectionHeading>
        <div className="device-language">
          <div><span>/threads</span><span>/timezones</span><span>/language</span><span>/thinking</span></div>
          <p>Use the slash as language. Use brackets to hold or reveal. Neither is filler.</p>
        </div>
        <div className="evidence-pair">
          <EvidenceFigure item={references.pharmacy} tone="dark" />
          <EvidenceFigure item={references.onDuty} tone="dark" />
        </div>
      </section>

      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.4`} title="Patterns">
          {offbeat.guidelines.system.block}
        </SectionHeading>
        <div className="pattern-reference-stack">
          <EvidenceFigure item={references.outerWall} />
          <EvidenceFigure item={references.multilingual} />
        </div>
      </section>

      <section className="content-section pink-section">
        <SectionHeading index={`${chapter.number}.5`} title="Pattern in use">
          Use repetition for atmosphere and depth. Keep the logo on the centre axis when it appears.
        </SectionHeading>
        <EvidenceFigure item={references.environmentalPattern} />
      </section>

      <section className="tool-section" id="shape-generator">
        <div className="tool-banner"><span>{offbeat.theme.banners.app}</span><span>{`${chapter.number}.6`}</span></div>
        <header className="tool-heading">
          <div><p className="eyebrow">Lore app · 01</p><h3>Shape Generator</h3></div>
          <p>{offbeat.guidelines.system.tool}</p>
        </header>
        <ShapeGenerator />
      </section>

      <section className="tool-section" id="template-generator">
        <div className="tool-banner"><span>{offbeat.theme.banners.app}</span><span>{`${chapter.number}.7`}</span></div>
        <header className="tool-heading">
          <div><p className="eyebrow">Lore app · 02</p><h3>Template Generator</h3></div>
          <p>{offbeat.guidelines.system.templates}</p>
        </header>
        <TemplateGenerator />
      </section>
    </>
  );
}

function HowToChapter() {
  const chapter = chapterBySlug("howto");
  const { intro, tools, micro, uiRule } = offbeat.guidelines.howto;
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.1`} title="Three tools">
          {intro}
        </SectionHeading>
        <div className="howto-list">
          {tools.map((tool) => (
            <div className="howto-step" key={tool.number}>
              <span className="howto-number">{tool.number}</span>
              <SilhouetteGlyph cut={tool.cut} steps={tool.steps} />
              <div>
                <h3>{tool.title}</h3>
                <p>{tool.note}</p>
                {tool.rule ? <p className="howto-rule">{tool.rule}</p> : null}
              </div>
            </div>
          ))}
        </div>
        <div className="micro-strip" aria-label="Micro graphic detail specimens">
          {micro.map((mark) => <span key={mark}>{mark}</span>)}
        </div>
      </section>

      <section className="content-section ink-section">
        <SectionHeading index={`${chapter.number}.2`} title="Shape in use">
          The stepped silhouette as product, object, and light.
        </SectionHeading>
        <div className="items-rail">
          {offbeat.media.items.map((item) =>
            item.format === "MP4"
              ? <MotionCard item={item} key={item.src} />
              : <MediaCard item={item} key={item.src} />,
          )}
        </div>
      </section>

      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.3`} title="When not to cut">
          {uiRule}
        </SectionHeading>
        <div className="ui-rule-demo">
          <figure className="ui-demo">
            <div className="ui-demo-stage">
              <span className="ui-demo-card" style={{ clipPath: steppedClipPath({ cut: 0.191, steps: 2 }) }}>Sign in</span>
            </div>
            <figcaption><strong>Don’t</strong><span>Cut corners on buttons, chips, or cards.</span></figcaption>
          </figure>
          <figure className="ui-demo">
            <div className="ui-demo-stage">
              <span className="ui-demo-card">Sign in</span>
            </div>
            <figcaption><strong>Do</strong><span>Keep small rectangles square; let colour and type carry the brand.</span></figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}

function TasteAlignmentChapter() {
  const chapter = chapterBySlug("taste-alignment");
  const heritage = offbeat.media.heritage;
  const taste = offbeat.media.tasteAlignment;
  return (
    <>
      <ChapterDirectory chapter={chapter} />
      <section className="content-section cream-section">
        <SectionHeading index={`${chapter.number}.1`} title="Origins">
          {offbeat.guidelines.inspiration.reference}
        </SectionHeading>
        <div className="heritage-board">
          <SteppedFigure item={heritage[0]} masked={false} />
          <div className="heritage-column">
            {heritage.slice(1, 3).map((item) => <SteppedFigure item={item} masked={false} key={item.src} />)}
          </div>
          <div className="heritage-column heritage-column-offset">
            {heritage.slice(3, 4).map((item) => <SteppedFigure item={item} masked={false} key={item.src} />)}
          </div>
        </div>
        <p className="section-note">
          Heritage references establish the rhythm and geometry. They are a starting point, not a decorative style to repeat literally.
        </p>
      </section>

      <section className="content-section pink-section taste-section taste-is">
        <SectionHeading index={`${chapter.number}.2`} title="What is off/beat">
          {offbeat.guidelines.inspiration.is}
        </SectionHeading>
        <div className="taste-principles"><span>Unexpected</span><span>Culturally alert</span><span>Real-world pink</span><span>Wit + tension</span></div>
        <TasteBoard items={taste.isOffbeat} boardUrl="https://in.pinterest.com/19s1750/what-is-offbeat/" label="What is OFF/BEAT" />
        <div className="taste-owned-example"><EvidenceFigure item={offbeat.media.guidelineReferences.pinkLighter} /></div>
      </section>

      <section className="content-section cream-section taste-section taste-is-not">
        <SectionHeading index={`${chapter.number}.3`} title="What is not off/beat">
          {offbeat.guidelines.inspiration.isNot}
        </SectionHeading>
        <div className="taste-principles taste-principles-avoid"><span>Cute for its own sake</span><span>Decorative softness</span><span>Generic polish</span><span>Pink as a filter</span></div>
        <TasteBoard items={taste.notOffbeat} boardUrl="https://in.pinterest.com/19s1750/what-is-not-offbeat/" label="What is not OFF/BEAT" />
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
    // The authenticated book mounts after the browser's initial hash pass.
    // Resolve cold deep links once the chapter DOM exists, without invoking
    // the browser's native fragment scroller (which can re-anchor later).
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const frame = window.requestAnimationFrame(() => {
      scrollToBookSection(hash);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const restoreSection = () => {
      const hash = window.location.hash.slice(1);
      if (hash) window.requestAnimationFrame(() => scrollToBookSection(hash));
    };
    window.addEventListener("popstate", restoreSection);
    return () => window.removeEventListener("popstate", restoreSection);
  }, []);

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

  function navigateWithinBook(event: ReactMouseEvent<HTMLElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const origin = event.target as HTMLElement;
    const anchor = origin.closest<HTMLAnchorElement>('a[href^="#"]');
    const hash = anchor?.getAttribute("href");
    if (!hash || hash === "#" || !scrollToBookSection(hash)) return;

    event.preventDefault();
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
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
    <main className="brand-book" style={themeStyle} id="top" onClick={navigateWithinBook}>
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
        <div className="contents-heading"><p className="eyebrow">Directory / {offbeat.chapters[0].number}–{offbeat.chapters[offbeat.chapters.length - 1].number}</p><h2 id="contents-title">Contents</h2></div>
        <nav className="contents-list" aria-label="Table of contents">
          {offbeat.chapters.map((chapter) => (
            <a href={`#${chapter.slug}`} key={chapter.slug}>
              <span>{chapter.number}</span><strong>{chapter.title}</strong><small>{chapter.status === "placeholder" ? "Material pending" : `${chapter.sections.length} sections`}</small><Icon name="arrow" />
            </a>
          ))}
        </nav>
        <div className="contents-footer"><p>Questions, approvals, or missing files?</p><a href={`mailto:${offbeat.client.contact}`}>{offbeat.client.contact} <Icon name="arrow" /></a></div>
      </section>

      <TasteAlignmentChapter />
      <LogoChapter />
      <TypographyChapter />
      <ColorChapter onCopy={copy} />
      <PhotographyChapter />
      <SystemChapter />
      <ApplicationChapter />
      <HowToChapter />
      <ArchiveSection />

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
