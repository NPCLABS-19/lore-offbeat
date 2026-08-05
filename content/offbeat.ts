export type AssetItem = {
  name: string;
  description: string;
  preview: string;
  download: string;
  format: string;
  surface?: "light" | "dark" | "pink";
};

export type Chapter = {
  number: string;
  slug: string;
  title: string;
  summary: string;
  sections: string[];
  status?: "ready" | "placeholder";
};

export type MediaItem = {
  name: string;
  src: string;
  format: "JPG" | "PNG" | "GIF" | "MP4";
  orientation: "landscape" | "portrait" | "square";
  alt: string;
  note?: string;
  /** Real pixel dimensions; when set, the card keeps the file's natural aspect. */
  width?: number;
  height?: number;
};

export type PhotoPrinciple = {
  number: string;
  title: string;
  note: string;
  item: MediaItem;
};

export type ArchiveEntry = {
  name: string;
  src: string;
  format: string;
  dimensions: string;
};

export type ArchiveGroup = {
  title: string;
  note: string;
  entries: ArchiveEntry[];
};

export type InspirationItem = MediaItem & {
  /** Attribution for open-source reference imagery. */
  credit: string;
  /** Silhouette parameters, matching the Shape Generator's presets. */
  cut: number;
  steps: number;
};

export type HowToStep = {
  number: string;
  title: string;
  note: string;
  /** Silhouette drawn beside the step. */
  cut: number;
  steps: number;
};

/**
 * LORE CLIENT CONFIG
 * ------------------
 * This is the single place to update client copy, chapter order, banners,
 * palette, typography, downloadable assets, access limits, and embedded apps.
 * The UI and PDF generator both mirror this model.
 */
export const offbeat = {
  product: {
    name: "Lore",
    descriptor: "Interactive brand book",
    owner: "Freelancer preview",
  },
  client: {
    name: "OFF/BEAT",
    displayName: "off/beat",
    guidelineTitle: "Brand Guidelines",
    edition: "Prototype · 01",
    contact: "hello@19-studio.com",
    intro:
      "A practical reference for OFF/BEAT’s visual and verbal identity. Use it as a starting point.",
  },
  access: {
    mode: "demo-magic-link" as const,
    maxUsers: 10,
    ownerEditingOnly: true,
  },
  theme: {
    colors: {
      ink: "#000000",
      paper: "#D1CDD2",
      pink: "#FF00B4",
      lilac: "#B85CC3",
      green: "#3E8557",
      rust: "#B7412E",
      olive: "#7C8152",
      cream: "#FFEFE9",
      khaki: "#A8A79A",
      white: "#FFFFFF",
    },
    fonts: {
      display: {
        family: "Archivo",
        file: "/offbeat/fonts/Archivo-Variable.ttf",
        label: "Archivo Narrow · Social headlines only",
      },
      body: {
        family: "Nimbus Sans",
        regular: "/offbeat/fonts/NimbusSans-Regular.otf",
        bold: "/offbeat/fonts/NimbusSans-Bold.otf",
        label: "Nimbus Sans / Helvetica · Primary",
      },
    },
    banners: {
      top: "Off/beat · Brand guidelines · Prototype",
      placeholder: "Client material to be added",
      app: "Design assistance · Live tool",
    },
    backgrounds: {
      cover: "paper",
      directories: "ink",
      content: "cream",
      tools: "ink",
    },
  },
  chapters: [
    {
      number: "01",
      slug: "logo",
      title: "Logo",
      summary:
        "The primary identifier of the OFF/BEAT brand.",
      sections: [
        "Primary identifier",
        "Construction",
        "Contrast and color",
        "Clearspace",
        "Approved files",
        "Explorations",
        "Motion",
        "Keep the beat",
      ],
      status: "ready",
    },
    {
      number: "02",
      slug: "typography",
      title: "Typography",
      summary:
        "A clear primary voice with one expressive social style.",
      sections: [
        "Introduction",
        "Primary typeface",
        "Social headlines",
        "Weights",
        "Specimen",
        "Setting type",
        "Hierarchy",
        "Type tester",
        "Don’ts",
      ],
      status: "ready",
    },
    {
      number: "03",
      slug: "color",
      title: "Color",
      summary:
        "A focused palette for contrast, recognition, and energy.",
      sections: [
        "Introduction",
        "Primary palette",
        "Secondary palette",
        "Proportion",
        "Combinations",
        "Contrast",
        "Don’ts",
      ],
      status: "ready",
    },
    {
      number: "04",
      slug: "photography",
      title: "Photography",
      summary:
        "Image treatments built from strong crops, familiar references, and graphic intervention.",
      sections: ["Image direction", "Recognisable references", "One graphic intervention", "Controlled grain"],
      status: "ready",
    },
    {
      number: "05",
      slug: "system",
      title: "System",
      summary:
        "One stepped silhouette carries colour, image, and voice.",
      sections: ["Overview", "Concept", "Collective", "Repeat", "Block", "Generator"],
      status: "ready",
    },
    {
      number: "06",
      slug: "application",
      title: "Application",
      summary:
        "Approved merchandise, object, and social applications.",
      sections: ["Merchandise and objects", "Social formats"],
      status: "ready",
    },
    {
      number: "07",
      slug: "howto",
      title: "How to off/beat",
      summary:
        "A working method in four moves.",
      sections: ["Cut the silhouette", "Ground the colour", "Set the voice", "Intervene once"],
      status: "ready",
    },
    {
      number: "08",
      slug: "inspiration",
      title: "Inspiration",
      summary:
        "Reference energy, held inside the off/beat silhouette.",
      sections: ["Moodboard", "Credits"],
      status: "ready",
    },
  ] satisfies Chapter[],
  guidelines: {
    welcomeUses: [
      "Understand the system",
      "Download approved assets",
      "Make with embedded tools",
    ],
    logo: {
      primary:
        "Use the logo as the clearest expression of the brand.",
      construction:
        "Build the mark from equal stepped cuts.",
      contrast:
        "Always preserve strong contrast.",
      clearspace:
        "Keep type, imagery, and other marks outside the clearspace.",
      assets:
        "Download approved source artwork.",
      consistency:
        "Protect recognition by using approved artwork.",
      sizing: [
        { label: "Minimum size", value: "20 px", note: "On screen" },
        { label: "Minimum size", value: "¼ in", note: "In print" },
        { label: "Maximum size", value: "∞", note: "No maximum" },
      ],
      donts: [
        { label: "Don’t stretch the logo.", glyph: "↔" },
        { label: "Don’t outline the logo.", glyph: "□" },
        { label: "Don’t rotate the logo.", glyph: "↗" },
        { label: "Don’t add shadows or effects.", glyph: "✦" },
        { label: "Don’t apply patterns.", glyph: "▦" },
        { label: "Don’t use unapproved colors.", glyph: "◒" },
      ],
    },
    typography: {
      primary:
        "Use Nimbus Sans Medium or Helvetica Medium for the primary brand voice.",
      supporting:
        "Reserve Archivo Narrow for social-media headlines. Never use it to typeset OFF/BEAT.",
      supportingSpecimen: "Clear, neutral, and easy to read.",
      hierarchy:
        "Create hierarchy with size, space, and Medium weight.",
      hierarchyBody:
        "Use Nimbus Sans Regular or Helvetica Regular in sentence case for longer reading. Keep line lengths measured and language direct.",
      tester:
        "Test the primary voice at different sizes and weights.",
      downloads:
        "Download supplied font files for approved work.",
    },
    color: {
      palette:
        "Use Signal Pink for recognition and neutrals for structure.",
      proportion:
        "Let neutral grounds lead. Use pink as a signal.",
      combinations:
        "Pair one expressive color with a calm ground.",
    },
    placeholders: {
      framework:
        "Reserved for approved client material.",
      disclaimer:
        "Placeholder only · no unapproved client imagery has been invented or represented as final.",
      photography: [
        { number: "01", name: "Hero image", format: "16:9 · treatment" },
        { number: "02", name: "People & place", format: "4:5 · direction" },
        { number: "03", name: "Detail", format: "1:1 · texture" },
      ],
    },
    system: {
      overview:
        "The system is where the brand comes alive. Every frame is one silhouette — a rectangle that loses its corners in equal steps, cut in the Shape Generator.",
      concept:
        "Every frame starts as a rectangle and loses its corners in equal steps. One to four cuts, set to the golden ratio — always from the generator, never drawn by hand.",
      collective:
        "Photography sits inside the silhouette. Vary the scale, the cut, and the count — the shape does the framing.",
      repeat:
        "One image, repeated across silhouettes, expresses momentum.",
      block:
        "Colour can replace photography as a block, carrying type or pattern.",
      shape:
        "Repeat, rotate, or frame with the stepped shape.",
      principles: [
        { number: "01", title: "Keep cuts equal", note: "Every step shares a consistent depth." },
        { number: "02", title: "Use contrast", note: "The silhouette should remain immediate." },
        { number: "03", title: "Build rhythm", note: "Repetition creates energy, not clutter." },
      ],
      tool:
        "Build and export an approved stepped composition.",
    },
    howto: [
      { number: "01", title: "Cut the silhouette", note: "Generate a stepped frame in the Shape Generator — one to four cuts, golden-ratio depths.", cut: 0.191, steps: 1 },
      { number: "02", title: "Ground the colour", note: "One expressive colour on a calm ground. Pink is a signal, not a wall.", cut: 0.191, steps: 2 },
      { number: "03", title: "Set the voice", note: "Helvetica or Nimbus Sans Medium, sentence case. Archivo Narrow only for social headlines.", cut: 0.309, steps: 3 },
      { number: "04", title: "Intervene once", note: "One crop, one repeat, or one block. Then stop.", cut: 0.309, steps: 4 },
    ] satisfies HowToStep[],
    offline: {
      title: "Download the guide",
      description:
        "A concise PDF of the core system.",
    },
  },
  palette: [
    { name: "Signal Pink", hex: "#FF00B4", role: "Primary expression", text: "#000000" },
    { name: "Ink", hex: "#000000", role: "Type and contrast", text: "#FFFFFF" },
    { name: "Soft Lilac", hex: "#D1CDD2", role: "Primary ground", text: "#000000" },
    { name: "Dark Gray", hex: "#A8A79A", role: "Primary neutral", text: "#000000" },
    { name: "Sienna", hex: "#B7412E", role: "Primary accent", text: "#000000" },
    { name: "Violet", hex: "#B85CC3", role: "Secondary", text: "#000000" },
    { name: "Field Green", hex: "#3E8557", role: "Secondary", text: "#000000" },
    { name: "Olive", hex: "#7C8152", role: "Secondary", text: "#000000" },
    { name: "Saddle Brown", hex: "#8C382E", role: "Secondary", text: "#FFFFFF" },
    { name: "Dark Slate", hex: "#353434", role: "Secondary neutral", text: "#FFFFFF" },
    { name: "Warm Cream", hex: "#FFEFE9", role: "Content ground", text: "#000000" },
  ],
  assets: [
    {
      name: "Primary logo",
      description: "Use this version on light, neutral, or approved color fields.",
      preview: "/offbeat/assets/logo-primary.svg",
      download: "/offbeat/assets/logo-primary.svg",
      format: "SVG",
      surface: "light",
    },
    {
      name: "Knockout logo",
      description: "Use this version when the primary artwork needs stronger contrast.",
      preview: "/offbeat/assets/logo-knockout.svg",
      download: "/offbeat/assets/logo-knockout.svg",
      format: "SVG",
      surface: "dark",
    },
    {
      name: "Clearspace guide",
      description: "Reference artwork showing the minimum breathing room around the mark.",
      preview: "/offbeat/assets/logo-clearspace.svg",
      download: "/offbeat/assets/logo-clearspace.svg",
      format: "SVG",
      surface: "light",
    },
    {
      name: "Supporting logo",
      description: "A supporting identifier for approved secondary applications.",
      preview: "/offbeat/assets/logo-supporting.svg",
      download: "/offbeat/assets/logo-supporting.svg",
      format: "SVG",
      surface: "pink",
    },
    {
      name: "Cover logo",
      description: "The stepped hero artwork used on the brand-book cover.",
      preview: "/offbeat/assets/cover-logo.svg",
      download: "/offbeat/assets/cover-logo.svg",
      format: "SVG",
      surface: "light",
    },
    {
      name: "Construction artwork",
      description: "Reference artwork explaining how the stepped logo geometry is formed.",
      preview: "/offbeat/assets/logo-construction.svg",
      download: "/offbeat/assets/logo-construction.svg",
      format: "SVG",
      surface: "light",
    },
    {
      name: "Slash insignia",
      description: "A compact supporting identifier for subtle digital brand seeding.",
      preview: "/offbeat/assets/slash-insignia.png",
      download: "/offbeat/assets/slash-insignia.png",
      format: "PNG",
      surface: "dark",
    },
  ] satisfies AssetItem[],
  /**
   * Media model
   * -----------
   * `showcase` holds the only media rendered on the page — a small, curated
   * selection per chapter. `archive` holds the remaining original source
   * files as download-only entries. Deck-derived page extractions are an
   * internal reference archive: they must never appear in either collection
   * (enforced by tests/rendered-html.test.mjs).
   */
  media: {
    showcase: {
      production: [
        { name: "Colourway master sheet", src: "/offbeat/media/logo-exports/asset-38.png", format: "PNG", orientation: "landscape", alt: "Master sheet of OFF/BEAT badge and plate colourways across pink, sienna, lilac, and neutral fields", note: "The variant system on one sheet", width: 1104, height: 832 },
        { name: "Knockout plate", src: "/offbeat/media/logo-exports/asset-10.png", format: "PNG", orientation: "landscape", alt: "White OFF/BEAT wordmark knocked out of a black stepped plate", note: "Black production surface", width: 1236, height: 364 },
        { name: "Co-brand lockups", src: "/offbeat/media/logo-exports/asset-17.png", format: "PNG", orientation: "landscape", alt: "Cuminco, God Mode, and Acme Inc partner lockups set in the OFF/BEAT badge", note: "Partnership usage", width: 1357, height: 221 },
      ] satisfies MediaItem[],
      motion: [
        { name: "Wordmark reveal", src: "/offbeat/media/motion/logo-wordmark-reveal.mp4", format: "MP4", orientation: "square", alt: "Animated OFF/BEAT wordmark reveal", note: "Hero reveal" },
        { name: "Slash loop", src: "/offbeat/media/motion/logo-slash-loop.mp4", format: "MP4", orientation: "square", alt: "Looping OFF/BEAT slash animation", note: "Signature loop" },
        { name: "Email signature", src: "/offbeat/media/motion/email-signature.gif", format: "GIF", orientation: "landscape", alt: "Pink OFF/BEAT animated email signature", note: "Motion in use", width: 756, height: 230 },
      ] satisfies MediaItem[],
      applications: [
        { name: "Anti VC Club tee", src: "/offbeat/media/social/anti-vc-shirt.jpg", format: "JPG", orientation: "square", alt: "Anti VC Club black T-shirt application", note: "Merchandise", width: 1440, height: 1440 },
        { name: "Anti 925 tee", src: "/offbeat/media/social/anti-925-shirt.jpg", format: "JPG", orientation: "square", alt: "Anti 925 warm-white T-shirt application", note: "Merchandise", width: 1440, height: 1440 },
        { name: "Embroidered cap", src: "/offbeat/media/social/cap-application.jpg", format: "JPG", orientation: "portrait", alt: "OFF/BEAT badge embroidered on a maroon cap", note: "Merchandise", width: 1439, height: 1920 },
        { name: "Starter kit", src: "/offbeat/media/social/starter-kit.jpg", format: "JPG", orientation: "portrait", alt: "OFF/BEAT starter kit rendered as a stepped pink object", note: "Object study", width: 1440, height: 1800 },
      ] satisfies MediaItem[],
      social: [
        { name: "Godmode launch", src: "/offbeat/media/social/godmode-launch.jpg", format: "JPG", orientation: "portrait", alt: "Godmode partnership launch social poster", note: "Partnership launch", width: 1440, height: 1793 },
        { name: "Startup swiping", src: "/offbeat/media/social/startup-swiping.jpg", format: "JPG", orientation: "portrait", alt: "Startup swiping with Aman Gupta social poster", note: "Event", width: 1440, height: 1809 },
        { name: "Partnership announcement", src: "/offbeat/media/social/partnership-announcement.jpg", format: "JPG", orientation: "portrait", alt: "Raj Sharma partnership announcement social design", note: "People", width: 1115, height: 1440 },
        { name: "Grooming report", src: "/offbeat/media/social/grooming-report.jpg", format: "JPG", orientation: "portrait", alt: "Men's grooming brands editorial report cover", note: "Report", width: 1440, height: 1786 },
        { name: "Venture capital", src: "/offbeat/media/social/venture-capital.jpg", format: "JPG", orientation: "portrait", alt: "Future of venture capital editorial social design", note: "Editorial", width: 1440, height: 1800 },
      ] satisfies MediaItem[],
    },
    /**
     * Open-source reference imagery (Unsplash archive via Lorem Picsum).
     * Not client work — shown only inside System and Inspiration as
     * clearly-credited reference material held in the brand silhouette.
     */
    inspiration: [
      { name: "Crowd energy", src: "/offbeat/media/inspiration/crowd-energy.jpg", format: "JPG", orientation: "portrait", alt: "Concert crowd with raised hands under stage light", credit: "Desi Mendoza · Unsplash", cut: 0.191, steps: 2, width: 1200, height: 1500 },
      { name: "Structure", src: "/offbeat/media/inspiration/structure-silhouette.jpg", format: "JPG", orientation: "square", alt: "Figure silhouetted against a steel-framed terminal window", credit: "Thong Vo · Unsplash", cut: 0.309, steps: 1, width: 1200, height: 1200 },
      { name: "Off duty", src: "/offbeat/media/inspiration/heels-red.jpg", format: "JPG", orientation: "portrait", alt: "White heels on a paint-splattered red floor", credit: "Alejandro Escamilla · Unsplash", cut: 0.191, steps: 3, width: 1200, height: 1500 },
      { name: "City after hours", src: "/offbeat/media/inspiration/city-bridge.jpg", format: "JPG", orientation: "landscape", alt: "Suspension bridge and skyline at night", credit: "Anders Jildén · Unsplash", cut: 0.309, steps: 2, width: 1600, height: 1000 },
      { name: "Keys", src: "/offbeat/media/inspiration/typewriter-keys.jpg", format: "JPG", orientation: "landscape", alt: "Vintage typewriter keys in close-up", credit: "Sergey Zolkin · Unsplash", cut: 0.09, steps: 1, width: 1200, height: 900 },
      { name: "Creator", src: "/offbeat/media/inspiration/camera-creator.jpg", format: "JPG", orientation: "portrait", alt: "Photographer holding a twin-lens camera, black and white", credit: "Jennifer Trovato · Unsplash", cut: 0.309, steps: 4, width: 1200, height: 1500 },
      { name: "Sea change", src: "/offbeat/media/inspiration/hooded-sea.jpg", format: "JPG", orientation: "square", alt: "Hooded figure facing the sea", credit: "Patryk Sobczak · Unsplash", cut: 0.382, steps: 2, width: 1200, height: 1200 },
      { name: "Desk hours", src: "/offbeat/media/inspiration/desk-work.jpg", format: "JPG", orientation: "landscape", alt: "Laptop and coffee on a warm wooden desk", credit: "Galymzhan Abdugalimov · Unsplash", cut: 0.191, steps: 4, width: 1600, height: 1000 },
    ] satisfies InspirationItem[],
    photography: [
      {
        number: "01",
        title: "Recognisable references",
        note: "Start from imagery the audience already knows, cropped with intent.",
        item: { name: "Work-life balance", src: "/offbeat/media/social/work-life-balance.jpg", format: "JPG", orientation: "portrait", alt: "Work-life balance editorial social design", width: 1440, height: 1800 },
      },
      {
        number: "02",
        title: "One graphic intervention",
        note: "Let repetition, montage, or type make the point — once.",
        item: { name: "AI duplicates", src: "/offbeat/media/social/ai-duplicates.jpg", format: "JPG", orientation: "portrait", alt: "Creating AI duplicates editorial social design", width: 1440, height: 1800 },
      },
      {
        number: "03",
        title: "Controlled grain",
        note: "Texture sits inside a single colourway so photography stays on the palette.",
        item: { name: "Shark Tank guide", src: "/offbeat/media/social/shark-tank-guide.jpg", format: "JPG", orientation: "portrait", alt: "Shark Tank survival guide social cover", width: 1440, height: 1800 },
      },
    ] satisfies PhotoPrinciple[],
    archive: [
      {
        title: "Logo production exports",
        note: "Colourway and surface permutations of the badge and plate.",
        entries: [
          { name: "Badge on signal pink", src: "/offbeat/media/logo-exports/asset-1.png", format: "PNG", dimensions: "1083 × 1075" },
          { name: "Badge on soft lilac", src: "/offbeat/media/logo-exports/asset-2.png", format: "PNG", dimensions: "1087 × 1079" },
          { name: "Signal pink plate, cutout", src: "/offbeat/media/logo-exports/asset-3.png", format: "PNG", dimensions: "625 × 184" },
          { name: "Badge on sienna I", src: "/offbeat/media/logo-exports/asset-4.png", format: "PNG", dimensions: "1085 × 1083" },
          { name: "Badge on sienna II", src: "/offbeat/media/logo-exports/asset-5.png", format: "PNG", dimensions: "1085 × 1083" },
          { name: "Sienna badge on lilac", src: "/offbeat/media/logo-exports/asset-6.png", format: "PNG", dimensions: "1087 × 1084" },
          { name: "Sienna plate, cutout", src: "/offbeat/media/logo-exports/asset-7.png", format: "PNG", dimensions: "847 × 250" },
          { name: "Sage plate, cutout", src: "/offbeat/media/logo-exports/asset-8.png", format: "PNG", dimensions: "1236 × 364" },
          { name: "Lilac plate, cutout", src: "/offbeat/media/logo-exports/asset-9.png", format: "PNG", dimensions: "1236 × 364" },
          { name: "Ghost wordmark on stone", src: "/offbeat/media/logo-exports/asset-11.png", format: "PNG", dimensions: "1233 × 361" },
          { name: "Badge on oxblood, wide", src: "/offbeat/media/logo-exports/asset-35.png", format: "PNG", dimensions: "1930 × 1083" },
        ],
      },
      {
        title: "Motion studies",
        note: "Duplicate or superseded loops, kept for production use.",
        entries: [
          { name: "Slash pulse", src: "/offbeat/media/motion/logo-slash.mp4", format: "MP4", dimensions: "1080 × 1080" },
          { name: "Bracket build", src: "/offbeat/media/motion/logo-brackets.mp4", format: "MP4", dimensions: "1080 × 1080" },
          { name: "Logo animation", src: "/offbeat/media/motion/logo-animation.gif", format: "GIF", dimensions: "1080 × 1080" },
        ],
      },
      {
        title: "Social library",
        note: "Published posts beyond the showcased formats.",
        entries: [
          { name: "AI workshop", src: "/offbeat/media/social/ai-workshop.jpg", format: "JPG", dimensions: "1440 × 1829" },
          { name: "Cohort applications", src: "/offbeat/media/social/cohort-applications.jpg", format: "JPG", dimensions: "1440 × 1800" },
          { name: "Solar investment", src: "/offbeat/media/social/solar-investment.jpg", format: "JPG", dimensions: "1440 × 1840" },
        ],
      },
    ] satisfies ArchiveGroup[],
  },
  fontDownloads: [
    { name: "Nimbus Sans Regular", path: "/offbeat/fonts/NimbusSans-Regular.otf", format: "OTF" },
    { name: "Nimbus Sans Bold", path: "/offbeat/fonts/NimbusSans-Bold.otf", format: "OTF" },
    { name: "Archivo · Social only", path: "/offbeat/fonts/Archivo-Variable.ttf", format: "TTF" },
  ],
  apps: [
    {
      name: "Shape Generator",
      slug: "shape-generator",
      description: "Build and export stepped OFF/BEAT compositions without leaving the guidelines.",
      status: "live",
    },
  ],
  downloads: {
    pdf: "/offbeat/offbeat-brand-guidelines.pdf",
  },
} as const;

export type OffbeatConfig = typeof offbeat;
