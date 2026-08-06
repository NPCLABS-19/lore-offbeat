/**
 * Stepped-corner silhouette math for the off/beat system.
 *
 * Mirrors `shapePath()` in app/components/ShapeGenerator.tsx — the generator
 * is the source of truth for the brand silhouette; keep the two in step.
 * Cut values come from the generator's presets (0.09 subtle, 0.191 φ,
 * 0.309 φ², 0.382 cross); steps run 1–4.
 */

export type Silhouette = {
  /** Corner cut as a fraction of each side, e.g. 0.191 for φ. */
  cut: number;
  /** Number of stepped cuts per corner, 1–4. */
  steps: number;
};

function points(
  cut: number,
  steps: number,
  width = 100,
  height = 100,
  cutXOverride?: number,
  cutYOverride?: number,
): Array<[number, number]> {
  const cutX = cutXOverride ?? width * cut;
  const cutY = cutYOverride ?? height * cut;
  const list: Array<[number, number]> = [];
  const add = (x: number, y: number) =>
    list.push([Number(x.toFixed(2)), Number(y.toFixed(2))]);

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

  return list;
}

/** CSS clip-path polygon for masking images into the silhouette. */
export function steppedClipPath({ cut, steps }: Silhouette): string {
  return `polygon(${points(cut, steps)
    .map(([x, y]) => `${x}% ${y}%`)
    .join(", ")})`;
}

/** SVG path (0–100 viewBox) for drawing the silhouette as artwork. */
export function steppedSvgPath({ cut, steps }: Silhouette): string {
  return `M${points(cut, steps)
    .map((point) => point.join(" "))
    .join(" L ")} Z`;
}

/**
 * SVG path at real pixel dimensions with equal-depth (square) cuts.
 *
 * Scaling the normalised path non-uniformly stretches the corner steps —
 * on a wide, short box the cut reads as a cross rather than a stepped corner.
 * Deriving the cut from the shorter side keeps every step the same depth,
 * which is the rule the system is built on.
 */
export function steppedRectPath(width: number, height: number, cut: number, steps: number): string {
  const depth = Math.min(width, height) * cut;
  return `M${points(cut, steps, width, height, depth, depth)
    .map((point) => point.join(" "))
    .join(" L ")} Z`;
}
