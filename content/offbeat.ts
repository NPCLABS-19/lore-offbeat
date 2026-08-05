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
      content: "white",
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
        "Introduction",
        "Construction",
        "On color",
        "Scaling",
        "Clearspace",
        "Supporting logo",
        "Logo use",
        "Don’ts",
        "Explorations",
        "Motion",
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
      sections: ["Image direction", "Composition", "Treatment", "Reference library"],
      status: "ready",
    },
    {
      number: "05",
      slug: "system",
      title: "System",
      summary:
        "Stepped geometry for layouts, frames, and motion.",
      sections: ["Shape language", "Composition", "Generator", "Export"],
      status: "ready",
    },
    {
      number: "06",
      slug: "application",
      title: "Application",
      summary:
        "Approved environmental, merchandise, editorial, and social applications.",
      sections: ["Environmental", "Merchandise", "Editorial", "Social media", "Motion"],
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
  media: {
    logoExplorations: [
      { name: "Construction study", src: "/offbeat/media/round-one/logo-construction.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT wordmark construction study" },
      { name: "Wordmark variants", src: "/offbeat/media/round-one/logo-wordmark-variants.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT wordmark variant explorations" },
      { name: "Knockout variants", src: "/offbeat/media/round-one/logo-knockout-variants.jpg", format: "JPG", orientation: "landscape", alt: "Knockout OFF/BEAT logo variants on black" },
      { name: "Color fields", src: "/offbeat/media/round-one/logo-color-fields.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT logo across approved color fields" },
      { name: "Slash exploration", src: "/offbeat/media/round-one/logo-slash-exploration.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT slash insignia exploration" },
      { name: "Slash icon", src: "/offbeat/media/round-one/logo-slash-icon.jpg", format: "JPG", orientation: "landscape", alt: "Pixel slash icon variants" },
      { name: "Color matrix", src: "/offbeat/media/round-one/logo-color-matrix.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT color and wordmark matrix" },
      { name: "Type exploration", src: "/offbeat/media/round-one/type-exploration.jpg", format: "JPG", orientation: "landscape", alt: "Round one OFF/BEAT type exploration" },
    ] satisfies MediaItem[],
    motion: [
      { name: "Slash pulse", src: "/offbeat/media/motion/logo-slash.mp4", format: "MP4", orientation: "square", alt: "Animated OFF/BEAT slash pulse" },
      { name: "Slash loop", src: "/offbeat/media/motion/logo-slash-loop.mp4", format: "MP4", orientation: "square", alt: "Looping OFF/BEAT slash animation" },
      { name: "Wordmark reveal", src: "/offbeat/media/motion/logo-wordmark-reveal.mp4", format: "MP4", orientation: "square", alt: "Animated OFF/BEAT wordmark reveal" },
      { name: "Bracket build", src: "/offbeat/media/motion/logo-brackets.mp4", format: "MP4", orientation: "square", alt: "Animated OFF/BEAT bracket construction" },
      { name: "Email signature", src: "/offbeat/media/motion/email-signature.gif", format: "GIF", orientation: "landscape", alt: "Pink OFF/BEAT animated email signature" },
      { name: "Logo animation", src: "/offbeat/media/motion/logo-animation.gif", format: "GIF", orientation: "square", alt: "Looping OFF/BEAT logo animation" },
    ] satisfies MediaItem[],
    applications: [
      { name: "Storefront system", src: "/offbeat/media/round-one/application-storefront.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT storefront and environmental signage exploration" },
      { name: "Campaign system", src: "/offbeat/media/round-one/application-campaign-board.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT campaign application board" },
      { name: "Shape language", src: "/offbeat/media/round-one/application-shape-system.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT stepped shape application system" },
      { name: "Food and apparel", src: "/offbeat/media/round-one/application-food-merch.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT food and T-shirt applications" },
      { name: "Cap application", src: "/offbeat/media/round-one/application-cap.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT logo applied to a cap" },
      { name: "Apparel system", src: "/offbeat/media/round-one/application-apparel.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT apparel application exploration" },
      { name: "Editorial guide", src: "/offbeat/media/round-one/application-editorial.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT editorial guide application" },
      { name: "Object study", src: "/offbeat/media/round-one/application-object.jpg", format: "JPG", orientation: "landscape", alt: "OFF/BEAT dimensional object exploration" },
    ] satisfies MediaItem[],
    social: [
      { name: "Partnership announcement", src: "/offbeat/media/social/partnership-announcement.jpg", format: "JPG", orientation: "portrait", alt: "Raj Sharma partnership announcement social design" },
      { name: "Cap application", src: "/offbeat/media/social/cap-application.jpg", format: "JPG", orientation: "portrait", alt: "OFF/BEAT embroidered cap application" },
      { name: "Godmode launch", src: "/offbeat/media/social/godmode-launch.jpg", format: "JPG", orientation: "portrait", alt: "Godmode partnership launch social poster" },
      { name: "Shark Tank guide", src: "/offbeat/media/social/shark-tank-guide.jpg", format: "JPG", orientation: "portrait", alt: "Shark Tank survival guide social cover" },
      { name: "AI workshop", src: "/offbeat/media/social/ai-workshop.jpg", format: "JPG", orientation: "portrait", alt: "Breaking and building with AI workshop social design" },
      { name: "Startup swiping", src: "/offbeat/media/social/startup-swiping.jpg", format: "JPG", orientation: "portrait", alt: "Startup swiping with Aman Gupta social poster" },
      { name: "Work-life balance", src: "/offbeat/media/social/work-life-balance.jpg", format: "JPG", orientation: "portrait", alt: "Work-life balance editorial social design" },
      { name: "AI duplicates", src: "/offbeat/media/social/ai-duplicates.jpg", format: "JPG", orientation: "portrait", alt: "Creating AI duplicates editorial social design" },
      { name: "Cohort applications", src: "/offbeat/media/social/cohort-applications.jpg", format: "JPG", orientation: "portrait", alt: "OFF/BEAT cohort applications social design" },
      { name: "Grooming report", src: "/offbeat/media/social/grooming-report.jpg", format: "JPG", orientation: "portrait", alt: "Men's grooming brands editorial report cover" },
      { name: "Anti VC Club", src: "/offbeat/media/social/anti-vc-shirt.jpg", format: "JPG", orientation: "square", alt: "Anti VC Club black T-shirt application" },
      { name: "Anti 925", src: "/offbeat/media/social/anti-925-shirt.jpg", format: "JPG", orientation: "square", alt: "Anti 925 warm-white T-shirt application" },
      { name: "Solar investment", src: "/offbeat/media/social/solar-investment.jpg", format: "JPG", orientation: "portrait", alt: "Solar investment announcement social design" },
      { name: "Venture capital", src: "/offbeat/media/social/venture-capital.jpg", format: "JPG", orientation: "portrait", alt: "Future of venture capital editorial social design" },
      { name: "Starter kit", src: "/offbeat/media/social/starter-kit.jpg", format: "JPG", orientation: "portrait", alt: "OFF/BEAT starter kit social design" },
    ] satisfies MediaItem[],
    logoExports: [
      "asset-1.png", "asset-2.png", "asset-3.png", "asset-4.png", "asset-5.png", "asset-6.png", "asset-7.png",
      "asset-8.png", "asset-9.png", "asset-10.png", "asset-11.png", "asset-17.png", "asset-35.png", "asset-38.png",
    ].map((file, index) => ({
      name: `Production export ${String(index + 1).padStart(2, "0")}`,
      src: `/offbeat/media/logo-exports/${file}`,
      format: "PNG" as const,
      orientation: "landscape" as const,
      alt: `OFF/BEAT production logo export ${index + 1}`,
    })),
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
