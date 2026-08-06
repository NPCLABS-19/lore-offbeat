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
  /** A hard usage rule attached to the principle, shown as a callout. */
  rule?: string;
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

export type HowToTool = {
  number: string;
  title: string;
  note: string;
  /** A hard usage rule attached to the tool, shown as a callout. */
  rule?: string;
  /** Silhouette drawn beside the tool. */
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
      slug: "inspiration",
      title: "Inspiration",
      summary:
        "Shape play from the heritage of India, modernised for the new Indian.",
      sections: ["The reference", "Energy"],
      status: "ready",
    },
    {
      number: "02",
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
      number: "03",
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
      number: "04",
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
      number: "05",
      slug: "photography",
      title: "Photography",
      summary:
        "Hard flash, direct and unsoftened, with one graphic intervention.",
      sections: ["Hard flash", "One graphic intervention", "Deviate from the pink"],
      status: "ready",
    },
    {
      number: "06",
      slug: "system",
      title: "System",
      summary:
        "One stepped silhouette carries colour, image, and voice.",
      sections: ["Overview", "Concept", "Collective", "Repeat", "Block", "Shape generator", "Template generator"],
      status: "ready",
    },
    {
      number: "07",
      slug: "application",
      title: "Application",
      summary:
        "Approved merchandise, object, and social applications.",
      sections: ["Merchandise and objects", "Social formats"],
      status: "ready",
    },
    {
      number: "08",
      slug: "howto",
      title: "How to off/beat",
      summary:
        "Three tools: the cut, the colour, the voice.",
      sections: ["The corner cut", "Signal pink", "Type and micro detail", "Shape in use", "When not to cut"],
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
        { label: "Minimum size", value: "1 in", note: "In print" },
        { label: "Minimum size", value: "96 px", note: "On screen" },
        { label: "Maximum size", value: "∞", note: "No maximum" },
      ],
      sizingRule:
        "Below 1 inch the badge loses its stepped corners. Use the alternate logo instead — never a shrunken primary logo.",
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
      templates:
        "Start a layout on the golden ratio, in the three ratios the brand ships in. Placeholder copy is editable; swap the wells for real artwork.",
    },
    inspiration: {
      reference:
        "The main reference for off/beat is shape play inspired by the heritage of India — stepwells, jaalis, patterned brickwork — modernised for the new Indian. It connects to our history and still gives a refreshed identity that looks to the future.",
      energy:
        "Energy the brand borrows from — crowds, structures, late hours — always held inside a generator silhouette.",
    },
    howto: {
      intro:
        "Three separate tools make something off/beat. Use them independently or together — each one is enough to carry the brand.",
      tools: [
        {
          number: "01",
          title: "The corner cut",
          note: "For everyday work the cut is free — one, three, or four steps, at any depth the generator allows. Keep experimenting, and give the corners enough room to read.",
          rule: "The iconic two-step cut is exclusive to large advertising surfaces: billboards, banners, environmental takeovers.",
          cut: 0.309,
          steps: 2,
        },
        {
          number: "02",
          title: "Signal pink",
          note: "One expressive colour on a calm ground. Pink is a signal, not a wall — it works without the cut.",
          cut: 0.191,
          steps: 3,
        },
        {
          number: "03",
          title: "Type",
          note: "Helvetica or Nimbus Sans Medium carries the voice; Archivo Narrow shouts on social. Micro graphic detail — copyright and trademark symbols, plus regional scripts — adds texture at small sizes.",
          cut: 0.09,
          steps: 1,
        },
      ] satisfies HowToTool[],
      micro: ["OFF/BEAT©", "ANTI 925™", "ऑफ/बीट", "OFF/BEAT®", "+65 · +99"],
      uiRule:
        "On small rectangles and interface elements — buttons, cards, inputs — keep corners square. Cutting at that scale congests the shape and the content inside it.",
    },
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
      name: "Alternate logo · patch",
      description: "The stepped slash patch. Use it wherever the primary logo would fall below one inch.",
      preview: "/offbeat/assets/logo-alt.png",
      download: "/offbeat/assets/logo-alt.png",
      format: "PNG",
      surface: "light",
    },
    {
      name: "Alternate logo · bracket",
      description: "The inverted bracketed lockup. Use it as the header mark on posters and campaign work.",
      preview: "/offbeat/assets/logo-bracket.png",
      download: "/offbeat/assets/logo-bracket.png",
      format: "PNG",
      surface: "light",
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
        { name: "AI workshop", src: "/offbeat/media/social/ai-workshop.jpg", format: "JPG", orientation: "portrait", alt: "Breaking and building with AI workshop social design", note: "Workshop", width: 1440, height: 1829 },
        { name: "Startup swiping", src: "/offbeat/media/social/startup-swiping.jpg", format: "JPG", orientation: "portrait", alt: "Startup swiping with Aman Gupta social poster", note: "Event", width: 1440, height: 1809 },
        { name: "Partnership announcement", src: "/offbeat/media/social/partnership-announcement.jpg", format: "JPG", orientation: "portrait", alt: "Raj Sharma partnership announcement social design", note: "People", width: 1115, height: 1440 },
        { name: "Grooming report", src: "/offbeat/media/social/grooming-report.jpg", format: "JPG", orientation: "portrait", alt: "Men's grooming brands editorial report cover", note: "Report", width: 1440, height: 1786 },
        { name: "Shark Tank guide", src: "/offbeat/media/social/shark-tank-guide.jpg", format: "JPG", orientation: "portrait", alt: "Shark Tank survival guide cover in an olive duotone", note: "Guide", width: 1440, height: 1800 },
      ] satisfies MediaItem[],
    },
    /**
     * OFF/BEAT ITEMS — supplied product posters and the neon motion piece,
     * shown as shape-in-use examples in How to off/beat.
     */
    items: [
      { name: "Cap table", src: "/offbeat/media/items/cap-table.jpg", format: "JPG", orientation: "portrait", alt: "OFF/BEAT ITEMS poster 01: a hot pink table with stepped corners reading CAP/TABLE", note: "Items 01", width: 1080, height: 1350 },
      { name: "925 clock", src: "/offbeat/media/items/clock-925.jpg", format: "JPG", orientation: "portrait", alt: "OFF/BEAT ITEMS poster 02: a stepped pink wall clock that freezes at 9am and resumes at 5pm", note: "Items 02", width: 1080, height: 1350 },
      { name: "Safety net", src: "/offbeat/media/items/safety-net.jpg", format: "JPG", orientation: "portrait", alt: "OFF/BEAT ITEMS poster 03: a pink safety net for things like IIT degrees", note: "Items 03", width: 1080, height: 1350 },
      { name: "Neon sign", src: "/offbeat/media/items/neon-sign.mp4", format: "MP4", orientation: "portrait", alt: "Glowing OFF/BEAT neon badge sign standing on a concrete block", note: "Motion", width: 900, height: 1350 },
    ] satisfies MediaItem[],
    /**
     * The primary reference: shape play from Indian heritage architecture.
     * Owner-supplied research images plus one Wikimedia Commons photograph;
     * reference material only, never presented as client work.
     */
    heritage: [
      { name: "Stepwell descent", src: "/offbeat/media/inspiration/stepwell-kund.jpg", format: "JPG", orientation: "portrait", alt: "Terracotta stepwell at Panna Meena ka Kund, a figure in teal walking its criss-crossing steps", credit: "Supplied reference", cut: 0.309, steps: 3, width: 1163, height: 1400 },
      { name: "Stepped tilework", src: "/offbeat/media/inspiration/stepped-tilework.jpg", format: "JPG", orientation: "portrait", alt: "Pink wall inlaid with blue tiles forming a stepped diamond around a recessed niche", credit: "Supplied reference", cut: 0.191, steps: 3, width: 1050, height: 1400 },
      { name: "Stepwell geometry", src: "/offbeat/media/inspiration/stepwell-geometry.jpg", format: "JPG", orientation: "portrait", alt: "Sunlit zigzag steps of a sandstone stepwell", credit: "Supplied reference", cut: 0.191, steps: 4, width: 934, height: 1400 },
      { name: "Stone jaali", src: "/offbeat/media/inspiration/stone-jaali.jpg", format: "JPG", orientation: "portrait", alt: "Carved stone jaali screen with stepped square openings and floral rosettes", credit: "Supplied reference · IndiTales", cut: 0.382, steps: 2, width: 480, height: 640 },
      { name: "Brick jaali", src: "/offbeat/media/inspiration/brick-jaali.jpg", format: "JPG", orientation: "square", alt: "Red brick jaali wall of repeating stepped cross openings", credit: "Supplied reference", cut: 0.309, steps: 1, width: 576, height: 599 },
      { name: "Patterned brickwork", src: "/offbeat/media/inspiration/brick-facade.jpg", format: "JPG", orientation: "square", alt: "Polychrome brick facade weaving diamond patterns across a stepped corner", credit: "Supplied reference", cut: 0.191, steps: 2, width: 852, height: 852 },
    ] satisfies InspirationItem[],
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
      { name: "Creator", src: "/offbeat/media/inspiration/camera-creator.jpg", format: "JPG", orientation: "portrait", alt: "Photographer holding a twin-lens camera, black and white", credit: "Jennifer Trovato · Unsplash", cut: 0.309, steps: 4, width: 1200, height: 1500 },
      { name: "Sea change", src: "/offbeat/media/inspiration/hooded-sea.jpg", format: "JPG", orientation: "square", alt: "Hooded figure facing the sea", credit: "Patryk Sobczak · Unsplash", cut: 0.382, steps: 2, width: 1200, height: 1200 },
      { name: "Desk hours", src: "/offbeat/media/inspiration/desk-work.jpg", format: "JPG", orientation: "landscape", alt: "Laptop and coffee on a warm wooden desk", credit: "Galymzhan Abdugalimov · Unsplash", cut: 0.191, steps: 4, width: 1600, height: 1000 },
    ] satisfies InspirationItem[],
    photography: [
      {
        number: "01",
        title: "Hard flash",
        note: "Shoot direct and unsoftened — blown highlights, hard shadows, honest texture. Hold the subject inside a stepped frame and keep experimenting with the corner designs; depth, count, and rhythm are all open.",
        rule: "Frame only where there is room. At poster, billboard, and cover scale the cut reads; on a small crop it closes in on the subject — leave the frame square instead.",
        item: { name: "Godmode launch", src: "/offbeat/media/social/godmode-launch.jpg", format: "JPG", orientation: "portrait", alt: "Godmode launch poster: a black-and-white flash portrait held inside a stepped frame on signal pink", width: 1440, height: 1793 },
      },
      {
        number: "02",
        title: "One graphic intervention",
        note: "Let repetition, montage, or type make the point — once.",
        item: { name: "AI duplicates", src: "/offbeat/media/social/ai-duplicates.jpg", format: "JPG", orientation: "portrait", alt: "Creating AI duplicates editorial social design", width: 1440, height: 1800 },
      },
      {
        number: "03",
        title: "Deviate from the pink",
        note: "Pink is a signal, not the only ground. Olive, sienna, violet, and field green all carry the brand — pick one colourway per piece and commit to it.",
        item: { name: "Venture capital", src: "/offbeat/media/social/venture-capital.jpg", format: "JPG", orientation: "portrait", alt: "Future of venture capital cover: black type on olive stepped plates over a grey-to-olive gradient", width: 1440, height: 1800 },
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
          { name: "Work-life balance", src: "/offbeat/media/social/work-life-balance.jpg", format: "JPG", dimensions: "1440 × 1800" },
          { name: "Cohort applications", src: "/offbeat/media/social/cohort-applications.jpg", format: "JPG", dimensions: "1440 × 1800" },
          { name: "Solar investment", src: "/offbeat/media/social/solar-investment.jpg", format: "JPG", dimensions: "1440 × 1840" },
        ],
      },
      {
        title: "Print production",
        note: "Dielines and print-ready artwork for physical applications.",
        entries: [
          { name: "Book cover dieline", src: "/offbeat/print/book-cover-dieline.pdf", format: "PDF", dimensions: "Cover spread" },
          { name: "Tote bag dieline", src: "/offbeat/print/tote-bag-dieline.pdf", format: "PDF", dimensions: "Print artwork" },
          { name: "Coaster dieline", src: "/offbeat/print/coaster-dieline.pdf", format: "PDF", dimensions: "4 × 4 in" },
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
    {
      name: "Template Generator",
      slug: "template-generator",
      description: "Start social and campaign layouts on the golden ratio in 1:1, 9:16, and 16:9.",
      status: "live",
    },
  ],
  downloads: {
    pdf: "/offbeat/offbeat-brand-guidelines.pdf",
  },
} as const;

export type OffbeatConfig = typeof offbeat;
