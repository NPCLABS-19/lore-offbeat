#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "fonttools>=4.58",
#   "reportlab>=4.3",
#   "svglib>=1.5",
# ]
# ///
"""Generate the downloadable OFF/BEAT brand guidelines PDF.

The source of truth remains ``content/offbeat.ts``.  Node's native TypeScript
loader serializes that object for this script, so palette, chapter, asset, and
contact changes flow into the exported book without duplicating the config.
"""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from typing import Any, Iterable

from fontTools.ttLib import TTFont as FontToolsTTFont
from fontTools.varLib.instancer import instantiateVariableFont
from reportlab.graphics import renderPDF
from reportlab.lib.colors import Color, HexColor
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from svglib.svglib import svg2rlg


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "content" / "offbeat.ts"
ASSET_ROOT = ROOT / "public" / "offbeat"
TMP_ROOT = ROOT / "tmp" / "pdfs"
OUTPUT_PATH = ROOT / "output" / "pdf" / "offbeat-brand-guidelines.pdf"
PUBLIC_PATH = ASSET_ROOT / "offbeat-brand-guidelines.pdf"

PAGE_W, PAGE_H = landscape(A4)
TOTAL_PAGES = 17


def load_config() -> dict[str, Any]:
    """Import the TypeScript config with the project's supported Node runtime."""

    source = (
        "import { pathToFileURL } from 'node:url';"
        "const m = await import(pathToFileURL(process.argv[1]).href);"
        "process.stdout.write(JSON.stringify(m.offbeat));"
    )
    completed = subprocess.run(
        ["node", "--input-type=module", "-e", source, str(CONFIG_PATH)],
        cwd=ROOT,
        check=True,
        text=True,
        capture_output=True,
    )
    return json.loads(completed.stdout)


def ascii_safe(value: str) -> str:
    return (
        value.replace("\u2014", " - ")
        .replace("\u2013", "-")
        .replace("\u2011", "-")
        .replace("\u2019", "'")
        .replace("\u2018", "'")
        .replace("\u00b7", "/")
    )


def static_archivo(source: Path, destination: Path, *, weight: int, width: int) -> None:
    """Create a static Archivo face so ReportLab can embed exact brand axes."""

    variable = FontToolsTTFont(str(source))
    instance = instantiateVariableFont(
        variable,
        {"wght": float(weight), "wdth": float(width)},
        inplace=False,
        updateFontNames=False,
    )
    destination.parent.mkdir(parents=True, exist_ok=True)
    instance.save(str(destination))


def register_fonts(config: dict[str, Any]) -> tuple[str, str, str]:
    social_source = ROOT / "public" / config["theme"]["fonts"]["display"]["file"].lstrip("/")
    social_path = TMP_ROOT / "Archivo-Social.ttf"
    static_archivo(social_source, social_path, weight=800, width=62)
    pdfmetrics.registerFont(TTFont("ArchivoSocial", str(social_path)))
    # ReportLab's built-in Helvetica is the PDF-safe equivalent of the
    # Helvetica/Nimbus Sans primary system used by the website.
    return "Helvetica-Bold", "Helvetica", "ArchivoSocial"


def fit_image_box(image_path: Path, box_w: float, box_h: float) -> tuple[float, float]:
    image = ImageReader(str(image_path))
    source_w, source_h = image.getSize()
    scale = min(box_w / source_w, box_h / source_h)
    return source_w * scale, source_h * scale


class BrandBook:
    def __init__(self, config: dict[str, Any], output_path: Path) -> None:
        self.config = config
        self.output_path = output_path
        self.c = canvas.Canvas(
            str(output_path),
            pagesize=(PAGE_W, PAGE_H),
            pageCompression=1,
            invariant=1,
        )
        self.c.setTitle(f"{config['client']['name']} Brand Guidelines")
        self.c.setAuthor("OFF/BEAT / Lore")
        self.c.setSubject("Portable interactive brand-book reference")
        self.c.setCreator("Lore brand-book PDF generator")
        self.page_number = 0
        self.section = ""
        self.display_font, self.text_font, self.social_font = register_fonts(config)
        self.colors = {key: HexColor(value) for key, value in config["theme"]["colors"].items()}
        self.ink = self.colors["ink"]
        self.paper = self.colors["paper"]
        self.pink = self.colors["pink"]
        self.cream = self.colors["cream"]
        self.white = self.colors["white"]

    # ------------------------------------------------------------------
    # Core drawing helpers
    # ------------------------------------------------------------------
    def start_page(self, background: Color, section: str, *, chrome: bool = True) -> None:
        if self.page_number:
            self.c.showPage()
        self.page_number += 1
        self.section = section
        self.c.setFillColor(background)
        self.c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        if chrome:
            self.draw_chrome(background)

    def draw_chrome(self, background: Color) -> None:
        dark = self.is_dark(background)
        color = self.white if dark else self.ink
        self.text(28, PAGE_H - 24, self.config["client"]["displayName"], 8.4, color, font="Helvetica-Bold", charspace=0.35)
        self.text(
            PAGE_W - 28,
            PAGE_H - 24,
            ascii_safe(self.config["client"]["guidelineTitle"]),
            8.4,
            color,
            font="Helvetica-Bold",
            align="right",
            charspace=0.35,
        )
        self.c.setStrokeColor(color)
        self.c.setLineWidth(0.55)
        self.c.line(28, PAGE_H - 33, PAGE_W - 28, PAGE_H - 33)
        self.c.line(28, 25, PAGE_W - 28, 25)
        self.text(28, 13, f"Lore / {ascii_safe(self.section)}", 7.2, color, font="Helvetica-Bold", charspace=0.08)
        self.text(
            PAGE_W - 28,
            13,
            f"{self.page_number:02d} / {TOTAL_PAGES:02d}",
            7.2,
            color,
            font="Helvetica-Bold",
            align="right",
            charspace=0.28,
        )

    def is_dark(self, color: Color) -> bool:
        return (0.2126 * color.red + 0.7152 * color.green + 0.0722 * color.blue) < 0.44

    def text(
        self,
        x: float,
        y: float,
        value: str,
        size: float,
        color: Color,
        *,
        font: str | None = None,
        align: str = "left",
        charspace: float = 0,
    ) -> None:
        value = ascii_safe(str(value))
        font_name = font or self.display_font
        text_object = self.c.beginText()
        text_object.setFont(font_name, size)
        text_object.setFillColor(color)
        text_object.setCharSpace(charspace)
        width = pdfmetrics.stringWidth(value, font_name, size) + max(len(value) - 1, 0) * charspace
        if align == "center":
            x -= width / 2
        elif align == "right":
            x -= width
        text_object.setTextOrigin(x, y)
        text_object.textOut(value)
        self.c.drawText(text_object)

    def wrapped(
        self,
        x: float,
        y: float,
        value: str,
        max_width: float,
        size: float,
        color: Color,
        *,
        font: str = "Helvetica",
        leading: float | None = None,
        max_lines: int | None = None,
    ) -> float:
        value = ascii_safe(value)
        leading = leading or size * 1.35
        words = value.split()
        lines: list[str] = []
        current = ""
        for word in words:
            candidate = f"{current} {word}".strip()
            if pdfmetrics.stringWidth(candidate, font, size) <= max_width or not current:
                current = candidate
            else:
                lines.append(current)
                current = word
        if current:
            lines.append(current)
        if max_lines and len(lines) > max_lines:
            lines = lines[:max_lines]
            while pdfmetrics.stringWidth(lines[-1] + "...", font, size) > max_width and lines[-1]:
                lines[-1] = lines[-1][:-1]
            lines[-1] += "..."
        for line in lines:
            self.text(x, y, line, size, color, font=font)
            y -= leading
        return y

    def label(self, x: float, y: float, value: str, color: Color, *, width: float | None = None) -> None:
        value = ascii_safe(value)
        if value.isupper():
            value = value.lower().capitalize()
        padding = 6
        label_w = width or pdfmetrics.stringWidth(value, "Helvetica-Bold", 7.2) + padding * 2
        self.c.setFillColor(color)
        self.c.rect(x, y - 3, label_w, 16, fill=1, stroke=0)
        self.text(x + padding, y + 2, value, 7.2, self.ink if not self.is_dark(color) else self.white, font="Helvetica-Bold", charspace=0.08)

    def section_title(self, number: str, title: str, summary: str, items: Iterable[str]) -> None:
        self.label(28, PAGE_H - 66, f"Chapter {number}", self.pink)
        self.text(28, PAGE_H - 148, title, 68, self.white, charspace=-0.35)
        self.wrapped(32, PAGE_H - 193, summary, 380, 13, self.paper, font="Helvetica", leading=17)
        x = PAGE_W - 273
        y = PAGE_H - 79
        self.text(x, y, "Directory", 8.3, self.pink, font="Helvetica-Bold", charspace=0.08)
        y -= 29
        for index, item in enumerate(items, start=1):
            self.c.setStrokeColor(Color(1, 1, 1, alpha=0.28))
            self.c.setLineWidth(0.4)
            self.c.line(x, y - 5, PAGE_W - 28, y - 5)
            self.text(x, y + 4, f"{index:02d}", 7.6, self.paper, font="Helvetica-Bold")
            self.text(x + 34, y + 2, str(item), 12, self.white, font=self.display_font)
            y -= 34
        self.step_shape(570, 44, 225, 74, self.pink, steps=4, rotation=180)

    def step_shape(
        self,
        x: float,
        y: float,
        width: float,
        height: float,
        color: Color,
        *,
        steps: int = 4,
        rotation: float = 0,
        stroke: Color | None = None,
    ) -> None:
        """Draw the core stepped pill as a symmetric orthogonal polygon."""

        self.c.saveState()
        self.c.translate(x + width / 2, y + height / 2)
        self.c.rotate(rotation)
        w = width
        h = height
        half_w = w / 2
        half_h = h / 2
        nose = min(w * 0.24, h * 1.35)
        step_x = nose / max(steps, 1)
        step_y = h / (2 * max(steps, 1))
        points: list[tuple[float, float]] = [(-half_w + nose, half_h), (half_w - nose, half_h)]
        for i in range(steps):
            points.append((half_w - nose + (i + 1) * step_x, half_h - i * step_y))
            points.append((half_w - nose + (i + 1) * step_x, half_h - (i + 1) * step_y))
        for i in range(steps):
            points.append((half_w - i * step_x, -((i + 1) * step_y)))
            points.append((half_w - (i + 1) * step_x, -((i + 1) * step_y)))
        points.append((-half_w + nose, -half_h))
        for i in range(steps):
            points.append((-half_w + nose - (i + 1) * step_x, -half_h + i * step_y))
            points.append((-half_w + nose - (i + 1) * step_x, -half_h + (i + 1) * step_y))
        for i in range(steps):
            points.append((-half_w + i * step_x, (i + 1) * step_y))
            points.append((-half_w + (i + 1) * step_x, (i + 1) * step_y))
        path = self.c.beginPath()
        path.moveTo(*points[0])
        for point in points[1:]:
            path.lineTo(*point)
        path.close()
        self.c.setFillColor(color)
        if stroke:
            self.c.setStrokeColor(stroke)
            self.c.setLineWidth(1)
        self.c.drawPath(path, fill=1, stroke=1 if stroke else 0)
        self.c.restoreState()

    def svg(self, path: Path, x: float, y: float, width: float, height: float) -> None:
        drawing = svg2rlg(str(path))
        if not drawing or not drawing.width or not drawing.height:
            self.c.setStrokeColor(self.ink)
            self.c.rect(x, y, width, height, fill=0, stroke=1)
            return
        scale = min(width / drawing.width, height / drawing.height)
        self.c.saveState()
        self.c.translate(x + (width - drawing.width * scale) / 2, y + (height - drawing.height * scale) / 2)
        self.c.scale(scale, scale)
        renderPDF.draw(drawing, self.c, 0, 0)
        self.c.restoreState()

    def png(self, path: Path, x: float, y: float, width: float, height: float, *, preserve: bool = True) -> None:
        image = ImageReader(str(path))
        if preserve:
            fitted_w, fitted_h = fit_image_box(path, width, height)
            x += (width - fitted_w) / 2
            y += (height - fitted_h) / 2
            width, height = fitted_w, fitted_h
        self.c.drawImage(image, x, y, width=width, height=height, mask="auto")

    def panel(self, x: float, y: float, width: float, height: float, fill: Color, *, stroke: Color | None = None) -> None:
        self.c.setFillColor(fill)
        if stroke:
            self.c.setStrokeColor(stroke)
            self.c.setLineWidth(0.6)
        self.c.rect(x, y, width, height, fill=1, stroke=1 if stroke else 0)

    # ------------------------------------------------------------------
    # Pages
    # ------------------------------------------------------------------
    def page_cover(self) -> None:
        self.start_page(self.paper, "Cover", chrome=False)
        self.panel(0, PAGE_H - 27, PAGE_W, 27, self.ink)
        self.text(28, PAGE_H - 19, self.config["theme"]["banners"]["top"], 7.6, self.white, font="Helvetica-Bold", charspace=0.55)
        self.text(28, PAGE_H - 58, self.config["client"]["displayName"], 10, self.ink, font="Helvetica-Bold", charspace=0.6)
        self.text(PAGE_W - 28, PAGE_H - 58, self.config["client"]["edition"], 10, self.ink, font="Helvetica-Bold", align="right", charspace=0.35)
        self.svg(ASSET_ROOT / "assets" / "cover-logo.svg", 72, 289, PAGE_W - 144, 195)
        self.text(28, 197, "BRAND", 67, self.ink, charspace=-0.65)
        self.text(28, 139, "GUIDELINES", 67, self.ink, charspace=-0.65)
        self.step_shape(PAGE_W - 279, 112, 246, 76, self.pink, steps=4)
        self.text(PAGE_W - 156, 140, "PROTOTYPE / 01", 11, self.ink, font="Helvetica-Bold", align="center", charspace=0.55)
        self.c.setStrokeColor(self.ink)
        self.c.setLineWidth(0.6)
        self.c.line(28, 91, PAGE_W - 28, 91)
        self.text(28, 67, "A PORTABLE REFERENCE FROM THE LORE INTERACTIVE BRAND BOOK", 8.5, self.ink, font="Helvetica-Bold", charspace=0.45)
        self.text(PAGE_W - 28, 67, "01 / 17", 8.5, self.ink, font="Helvetica-Bold", align="right", charspace=0.45)

    def page_contents(self) -> None:
        self.start_page(self.ink, "Contents")
        self.label(28, PAGE_H - 65, "START HERE", self.pink)
        self.text(28, PAGE_H - 113, "THE BOOK", 39, self.white, charspace=-0.25)
        intro = self.config["client"]["intro"]
        self.wrapped(28, PAGE_H - 148, intro, 365, 13.3, self.paper, font="Helvetica", leading=18.5)
        self.text(28, 146, "Contact", 7.5, self.pink, font="Helvetica-Bold", charspace=0.08)
        self.text(28, 123, self.config["client"]["contact"], 18, self.white, font=self.text_font)
        self.text(28, 83, "Built for screen. Kept useful on paper.", 10, self.paper, font="Helvetica")
        x = 432
        y = PAGE_H - 74
        self.text(x, y, "Contents", 8, self.pink, font="Helvetica-Bold", charspace=0.08)
        y -= 26
        page_targets = [3, 7, 10, 13, 14, 16]
        for chapter, target in zip(self.config["chapters"], page_targets):
            self.c.setStrokeColor(Color(1, 1, 1, alpha=0.24))
            self.c.setLineWidth(0.4)
            self.c.line(x, y - 10, PAGE_W - 28, y - 10)
            status = "Material pending" if chapter.get("status") == "placeholder" else f"Page {target:02d}"
            self.text(x, y + 3, chapter["number"], 8, self.paper, font="Helvetica-Bold")
            self.text(x + 35, y, chapter["title"], 19, self.white, font=self.display_font)
            self.text(PAGE_W - 28, y + 3, status, 6.8, self.pink if "pending" in status else self.paper, font="Helvetica-Bold", align="right", charspace=0.08)
            y -= 58
        self.text(x, y + 3, "--", 8, self.paper, font="Helvetica-Bold")
        self.text(x + 35, y, "Download index", 19, self.white, font=self.display_font)
        self.text(PAGE_W - 28, y + 3, "Page 17", 6.8, self.paper, font="Helvetica-Bold", align="right", charspace=0.08)

    def page_logo_opener(self) -> None:
        chapter = self.config["chapters"][0]
        self.start_page(self.ink, "Logo")
        self.section_title(chapter["number"], chapter["title"], chapter["summary"], chapter["sections"])

    def page_logo_core(self) -> None:
        self.start_page(self.cream, "Logo / Core mark")
        self.label(28, PAGE_H - 66, "01.01 / CORE MARK", self.pink)
        self.text(28, PAGE_H - 107, "PRIMARY IDENTIFIER", 34, self.ink, charspace=-0.2)
        left_x, panel_y, panel_h = 28, 165, 286
        left_w = 392
        right_x, right_w = 438, PAGE_W - 466
        self.panel(left_x, panel_y, left_w, panel_h, self.paper)
        self.svg(ASSET_ROOT / "assets" / "logo-primary.svg", left_x + 35, panel_y + 78, left_w - 70, 128)
        self.text(left_x + 16, panel_y + 20, "PRIMARY LOGO / LIGHT FIELD", 7.5, self.ink, font="Helvetica-Bold", charspace=0.4)
        self.panel(right_x, panel_y, right_w, panel_h, self.white, stroke=self.ink)
        self.svg(ASSET_ROOT / "assets" / "logo-construction.svg", right_x + 20, panel_y + 70, right_w - 40, 155)
        self.text(right_x + 16, panel_y + 20, "CONSTRUCTION / REFERENCE", 7.5, self.ink, font="Helvetica-Bold", charspace=0.4)
        y = 125
        self.wrapped(28, y, self.config["chapters"][0]["summary"], 380, 10.8, self.ink, font="Helvetica", leading=14)
        self.wrapped(438, y, "Use supplied master artwork. Do not redraw the mark or simplify its stepped geometry.", 330, 10.8, self.ink, font="Helvetica", leading=14)

    def page_logo_rules(self) -> None:
        self.start_page(self.pink, "Logo / Rules")
        self.label(28, PAGE_H - 66, "01.02 / SPACE + SCALE", self.ink)
        self.text(28, PAGE_H - 107, "KEEP THE SIGNAL CLEAR", 34, self.ink, charspace=-0.2)
        self.panel(28, 199, 451, 246, self.paper)
        self.svg(ASSET_ROOT / "assets" / "logo-clearspace.svg", 51, 235, 405, 174)
        self.text(44, 215, "CLEARSPACE / USE THE SUPPLIED GUIDE", 7.5, self.ink, font="Helvetica-Bold", charspace=0.4)
        rules = [
            ("MINIMUM SIZE", "20 px on screen / 1/4 inch in print"),
            ("CONTRAST", "Choose the approved artwork that stays legible"),
            ("CLEARSPACE", "Keep type, edges, and graphics outside the guide"),
        ]
        x, y = 500, 411
        for title, body in rules:
            self.panel(x, y - 65, PAGE_W - x - 28, 65, self.ink)
            self.text(x + 14, y - 21, title, 7.5, self.pink, font="Helvetica-Bold", charspace=0.45)
            self.wrapped(x + 14, y - 39, body, PAGE_W - x - 57, 9.3, self.white, font="Helvetica", leading=11.5, max_lines=2)
            y -= 76
        self.text(28, 163, "DO", 8, self.ink, font="Helvetica-Bold", charspace=0.6)
        self.text(424, 163, "DON'T", 8, self.ink, font="Helvetica-Bold", charspace=0.6)
        dos = "Use master artwork / maintain proportion / protect contrast"
        donts = "Stretch / rotate / outline / add effects / recolor outside the palette"
        self.wrapped(28, 141, dos, 360, 12.4, self.ink, font=self.text_font, leading=17)
        self.wrapped(424, 141, donts, 378, 12.4, self.ink, font=self.text_font, leading=17)

    def page_logo_assets(self) -> None:
        self.start_page(self.paper, "Logo / Asset suite")
        self.label(28, PAGE_H - 66, "01.03 / ASSET SUITE", self.pink)
        self.text(28, PAGE_H - 108, "READY TO DOWNLOAD", 34, self.ink, charspace=-0.2)
        cards = [
            ("logo-primary.svg", "logo-primary.svg", self.cream),
            ("logo-knockout.svg", "logo-knockout.svg", self.ink),
            ("logo-supporting.svg", "logo-supporting.svg", self.pink),
        ]
        gap = 14
        card_w = (PAGE_W - 56 - gap * 2) / 3
        for index, (filename, asset, fill) in enumerate(cards):
            x = 28 + index * (card_w + gap)
            self.panel(x, 219, card_w, 224, fill)
            self.svg(ASSET_ROOT / "assets" / asset, x + 20, 272, card_w - 40, 100)
            text_color = self.white if self.is_dark(fill) else self.ink
            self.text(x + 14, 238, filename, 7.3, text_color, font="Helvetica-Bold", charspace=0.05)
        self.panel(28, 61, PAGE_W - 56, 135, self.ink)
        self.png(ASSET_ROOT / "assets" / "slash-insignia.png", 45, 76, 155, 104)
        self.text(224, 156, "SUPPORTING INSIGNIA", 8, self.pink, font="Helvetica-Bold", charspace=0.55)
        self.text(224, 120, "SEED THE BRAND.", 30, self.white, charspace=-0.1)
        self.wrapped(224, 93, "Use sparingly as a watermark, icon, or compact digital signature. The primary logo remains the lead identifier.", 500, 9.7, self.paper, font="Helvetica", leading=13)

    def page_typography_opener(self) -> None:
        chapter = self.config["chapters"][1]
        self.start_page(self.ink, "Typography")
        self.section_title(chapter["number"], chapter["title"], chapter["summary"], chapter["sections"])

    def page_typography_system(self) -> None:
        self.start_page(self.cream, "Typography / System")
        self.label(28, PAGE_H - 66, "02.01 / Type system", self.pink)
        self.text(28, PAGE_H - 107, "Primary typeface", 34, self.ink, charspace=-0.15)
        self.panel(28, 257, 484, 186, self.white)
        self.text(47, 365, "Helvetica /", 50, self.ink, font=self.display_font, charspace=-0.35)
        self.text(47, 315, "Nimbus Sans", 50, self.ink, font=self.display_font, charspace=-0.35)
        self.text(49, 283, "Medium / Primary brand voice", 8, self.ink, font="Helvetica-Bold", charspace=0.05)
        self.panel(530, 257, PAGE_W - 558, 186, self.pink)
        self.text(549, 365, "LOUD IDEAS", 44, self.ink, font=self.social_font, charspace=0.2)
        self.text(550, 331, "Archivo Narrow / Social headlines only", 8, self.ink, font="Helvetica-Bold", charspace=0.05)
        self.wrapped(550, 299, "Never use Archivo to typeset OFF/BEAT.", PAGE_W - 585, 10.5, self.ink, font=self.text_font, leading=14)
        self.text(28, 219, "Hierarchy", 8, self.ink, font="Helvetica-Bold", charspace=0.08)
        rows = [
            ("Headline", "Nimbus Sans Medium / sentence case", 27, self.display_font),
            ("Subhead", "Nimbus Sans Medium", 18, self.display_font),
            ("Body", "Nimbus Sans Regular", 11, self.text_font),
        ]
        y = 179
        for label, spec, size, font in rows:
            self.c.setStrokeColor(self.ink)
            self.c.setLineWidth(0.5)
            self.c.line(28, y - 10, PAGE_W - 28, y - 10)
            self.text(28, y, label, 7.4, self.pink, font="Helvetica-Bold", charspace=0.45)
            self.text(154, y - (size - 8) / 3, "Clear ideas, carefully expressed.", size, self.ink, font=font)
            self.text(PAGE_W - 28, y, spec, 7.4, self.ink, font="Helvetica", align="right")
            y -= 48

    def page_typography_specimen(self) -> None:
        self.start_page(self.pink, "Typography / Specimen")
        self.label(28, PAGE_H - 66, "02.02 / Social headlines", self.ink)
        self.text(28, PAGE_H - 136, "LOUD IDEAS", 82, self.ink, font=self.social_font, charspace=0)
        self.text(28, PAGE_H - 218, "CLEAR SIGNAL", 82, self.ink, font=self.social_font, charspace=0)
        self.c.setStrokeColor(self.ink)
        self.c.setLineWidth(0.8)
        self.c.line(28, 315, PAGE_W - 28, 315)
        alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        numerals = "0123456789 / + x ( ) ? !"
        self.text(28, 277, alphabet, 29, self.ink, font=self.social_font, charspace=1.4)
        self.text(28, 235, numerals, 26, self.ink, font=self.social_font, charspace=1.5)
        self.panel(28, 61, 386, 134, self.ink)
        self.text(44, 165, "Setting type", 7.5, self.pink, font="Helvetica-Bold", charspace=0.08)
        self.wrapped(44, 138, "Use only for social headlines. Keep the words short and the spacing open.", 336, 11.2, self.white, font=self.text_font, leading=15)
        self.panel(428, 61, PAGE_W - 456, 134, self.paper)
        self.text(444, 165, "Principles", 7.5, self.ink, font="Helvetica-Bold", charspace=0.08)
        self.wrapped(444, 138, "Helvetica or Nimbus Sans carries every other part of the brand system.", PAGE_W - 487, 11.2, self.ink, font=self.text_font, leading=15)

    def page_color_opener(self) -> None:
        chapter = self.config["chapters"][2]
        self.start_page(self.ink, "Color")
        self.section_title(chapter["number"], chapter["title"], chapter["summary"], chapter["sections"])

    def page_palette(self) -> None:
        self.start_page(self.cream, "Color / Palette")
        self.label(28, PAGE_H - 66, "03.01 / PALETTE", self.pink)
        self.text(28, PAGE_H - 107, "COLOR WITH INTENT", 34, self.ink, charspace=-0.2)
        palette = self.config["palette"]
        cols = 4
        gap = 10
        card_w = (PAGE_W - 56 - gap * (cols - 1)) / cols
        card_h = 108
        start_y = 337
        for i, entry in enumerate(palette):
            row, col = divmod(i, cols)
            x = 28 + col * (card_w + gap)
            y = start_y - row * (card_h + gap)
            swatch = HexColor(entry["hex"])
            self.panel(x, y, card_w, card_h, swatch, stroke=self.ink if entry["hex"].upper() in {"#FFFFFF", "#FFEFE9", "#D1CDD2"} else None)
            text_color = HexColor(entry.get("text", "#000000"))
            self.text(x + 12, y + 34, entry["name"], 9.2, text_color, font=self.display_font)
            self.text(x + 12, y + 17, entry["hex"].upper(), 7.2, text_color, font="Helvetica-Bold", charspace=0.4)
            self.text(x + card_w - 12, y + 17, entry["role"], 6.5, text_color, font="Helvetica-Bold", align="right", charspace=0.05)
        note_x = 28 + 3 * (card_w + gap)
        note_y = start_y - 2 * (card_h + gap)
        self.panel(note_x, note_y, card_w, card_h, self.ink)
        self.text(note_x + 12, note_y + 60, "PAIR WITH", 14, self.white, font=self.display_font, charspace=0.15)
        self.text(note_x + 12, note_y + 39, "PURPOSE.", 14, self.pink, font=self.display_font, charspace=0.15)
        self.text(note_x + 12, note_y + 17, "CONTRAST FIRST", 6.5, self.paper, font="Helvetica-Bold", charspace=0.3)
        self.text(28, 67, "Signal Pink leads expression. Ink and Soft Lilac anchor the system. Secondary colors rotate in with purpose.", 9.3, self.ink, font="Helvetica")

    def page_color_combinations(self) -> None:
        self.start_page(self.paper, "Color / Combinations")
        self.label(28, PAGE_H - 66, "03.02 / COMBINATIONS", self.pink)
        self.text(28, PAGE_H - 107, "CONTRAST FIRST", 34, self.ink, charspace=-0.2)
        pairings = [
            ("#FF00B4", "#000000", "PRIMARY HIT"),
            ("#000000", "#D1CDD2", "HIGH CONTRAST"),
            ("#3E8557", "#000000", "SECONDARY FIELD"),
            ("#B7412E", "#FFEFE9", "WARM ACCENT"),
        ]
        card_w = (PAGE_W - 70) / 2
        card_h = 151
        for i, (background, foreground, label) in enumerate(pairings):
            col, row = i % 2, i // 2
            x = 28 + col * (card_w + 14)
            y = 274 - row * (card_h + 14)
            bg, fg = HexColor(background), HexColor(foreground)
            self.panel(x, y, card_w, card_h, bg)
            self.text(x + 16, y + 89, "OFF/BEAT", 41, fg, font=self.display_font, charspace=-0.3)
            self.text(x + 16, y + 23, f"{label} / {background} + {foreground}", 7.2, fg, font="Helvetica-Bold", charspace=0.35)
        self.text(28, 79, "CHECK", 7.6, self.pink, font="Helvetica-Bold", charspace=0.5)
        self.wrapped(89, 80, "Keep essential text readable. Use approved high-contrast pairs for small type and interface states.", 482, 9.8, self.ink, font="Helvetica", leading=13)
        self.text(PAGE_W - 28, 79, "NEVER RELY ON COLOR ALONE", 7.6, self.ink, font="Helvetica-Bold", align="right", charspace=0.35)

    def page_photography_placeholder(self) -> None:
        chapter = self.config["chapters"][3]
        self.start_page(self.colors["khaki"], "Photography / Placeholder")
        self.label(28, PAGE_H - 66, self.config["theme"]["banners"]["placeholder"], self.pink, width=190)
        self.text(28, PAGE_H - 128, "04 / PHOTOGRAPHY", 51, self.ink, charspace=-0.35)
        self.text(28, PAGE_H - 181, "IMAGE DIRECTION", 51, self.ink, charspace=-0.35)
        self.text(28, PAGE_H - 234, "TO FOLLOW.", 51, self.ink, charspace=-0.35)
        self.step_shape(512, 194, 287, 116, self.pink, steps=4, rotation=-12)
        self.text(655, 241, "PENDING", 18, self.ink, font=self.display_font, align="center", charspace=0.7)
        self.panel(28, 64, PAGE_W - 56, 107, self.ink)
        self.wrapped(44, 133, chapter["summary"], 470, 10.5, self.white, font="Helvetica", leading=14)
        items = " / ".join(chapter["sections"])
        self.wrapped(541, 133, items, 250, 8.3, self.pink, font="Helvetica-Bold", leading=12)
        self.text(44, 82, "Placeholder structure only. Replace when the approved image pack arrives.", 7.5, self.paper, font="Helvetica-Bold", charspace=0.2)

    def page_system_opener(self) -> None:
        chapter = self.config["chapters"][4]
        self.start_page(self.ink, "System")
        self.label(28, PAGE_H - 66, f"CHAPTER {chapter['number']}", self.pink)
        self.text(28, PAGE_H - 129, "SYSTEM", 76, self.white, charspace=-0.7)
        self.wrapped(32, PAGE_H - 173, chapter["summary"], 348, 12.5, self.paper, font="Helvetica", leading=17)
        self.panel(411, 72, PAGE_W - 439, 414, self.white)
        self.png(ASSET_ROOT / "assets" / "shape-grid.png", 427, 92, PAGE_W - 471, 370)
        self.text(28, 123, "SHAPE LANGUAGE", 8, self.pink, font="Helvetica-Bold", charspace=0.55)
        self.text(28, 90, "A FLEXIBLE DEVICE", 25, self.white, font=self.display_font)
        self.text(28, 68, "FOR LAYOUT, STICKERS, FRAMES + MOTION", 8, self.paper, font="Helvetica-Bold", charspace=0.35)

    def page_shape_system(self) -> None:
        self.start_page(self.cream, "System / Generator")
        self.label(28, PAGE_H - 66, self.config["theme"]["banners"]["app"], self.pink, width=188)
        self.text(28, PAGE_H - 107, "SHAPE GENERATOR", 34, self.ink, charspace=-0.2)
        self.panel(28, 188, 465, 256, self.ink)
        self.step_shape(79, 278, 362, 102, self.pink, steps=4, rotation=0)
        self.text(260, 319, "OFF/BEAT", 23, self.ink, font=self.display_font, align="center", charspace=0.55)
        self.text(44, 212, "LIVE TOOL / AVAILABLE IN THE LORE WEBSITE", 7.4, self.white, font="Helvetica-Bold", charspace=0.4)
        controls = [
            ("FORMAT", "1:1 / phi / 4:5 / 2:3 / 16:9"),
            ("GEOMETRY", "corner cut / 1-4 steps / rotation"),
            ("LAYOUT", "single / 2x2 / 3x3"),
            ("STYLE", "fill / background / gradient / sticker"),
            ("EXPORT", "SVG / 2x PNG / copy SVG"),
        ]
        x, y = 516, 429
        for index, (name, detail) in enumerate(controls, start=1):
            self.c.setStrokeColor(self.ink)
            self.c.setLineWidth(0.5)
            self.c.line(x, y - 7, PAGE_W - 28, y - 7)
            self.text(x, y + 3, f"{index:02d}", 7, self.pink, font="Helvetica-Bold")
            self.text(x + 31, y + 1, name, 11, self.ink, font=self.display_font, charspace=0.1)
            self.text(PAGE_W - 28, y + 2, detail.upper(), 6.6, self.ink, font="Helvetica-Bold", align="right", charspace=0.2)
            y -= 49
        self.text(28, 151, "SYSTEM PRINCIPLE", 7.5, self.pink, font="Helvetica-Bold", charspace=0.55)
        self.wrapped(28, 124, "Keep the stepped cut legible. Favor one strong gesture over visual noise. Use rotation, grids, and repetition to create rhythm without disguising the core form.", 600, 11.5, self.ink, font="Helvetica", leading=15)
        self.text(PAGE_W - 28, 106, "BUILD / TEST / EXPORT", 9, self.ink, font="Helvetica-Bold", align="right", charspace=0.55)

    def page_application_placeholder(self) -> None:
        chapter = self.config["chapters"][5]
        self.start_page(self.colors["lilac"], "Application / Placeholder")
        self.label(28, PAGE_H - 66, self.config["theme"]["banners"]["placeholder"], self.pink, width=190)
        self.text(28, PAGE_H - 118, "06 / APPLICATION", 47, self.ink, charspace=-0.3)
        self.wrapped(28, PAGE_H - 158, chapter["summary"], 390, 11.5, self.ink, font="Helvetica", leading=15.5)
        tiles = [
            (38, 87, 218, 238, self.pink, "SOCIAL"),
            (274, 87, 218, 238, self.ink, "CAMPAIGN"),
            (510, 87, 294, 238, self.colors["green"], "PARTNERSHIPS"),
        ]
        for x, y, w, h, fill, title in tiles:
            self.panel(x, y, w, h, fill)
            text_color = self.white if self.is_dark(fill) else self.ink
            self.text(x + 14, y + h - 27, title, 8, text_color, font="Helvetica-Bold", charspace=0.5)
            self.c.setStrokeColor(text_color)
            self.c.setLineWidth(0.75)
            self.c.rect(x + 14, y + 46, w - 28, h - 91, fill=0, stroke=1)
            self.text(x + w / 2, y + h / 2 - 2, "PLACEHOLDER", 12, text_color, font=self.display_font, align="center", charspace=0.7)
            self.text(x + 14, y + 20, "APPROVED EXAMPLE TO FOLLOW", 6.8, text_color, font="Helvetica-Bold", charspace=0.3)
        self.text(28, 52, "Replace these modules when approved campaign, social, product, editorial, and partnership examples arrive.", 8, self.ink, font="Helvetica-Bold", charspace=0.18)

    def page_download_index(self) -> None:
        self.start_page(self.cream, "Download index")
        self.label(28, PAGE_H - 66, "PORTABLE ASSET INDEX", self.pink)
        self.text(28, PAGE_H - 107, "TAKE THE RIGHT FILE", 34, self.ink, charspace=-0.2)
        self.wrapped(28, PAGE_H - 137, "All master files remain downloadable from the Lore website. This page records the current prototype pack.", 530, 10.5, self.ink, font="Helvetica", leading=14)
        assets = self.config["assets"]
        x, y = 28, 404
        self.text(x, y, "LOGO + SYSTEM ASSETS", 7.6, self.pink, font="Helvetica-Bold", charspace=0.55)
        y -= 25
        for index, asset in enumerate(assets, start=1):
            self.c.setStrokeColor(self.ink)
            self.c.setLineWidth(0.4)
            self.c.line(x, y - 7, 493, y - 7)
            self.text(x, y + 2, f"{index:02d}", 6.9, self.colors["khaki"], font="Helvetica-Bold")
            self.text(x + 31, y, asset["name"], 10.5, self.ink, font=self.display_font)
            self.text(479, y + 2, asset["format"], 6.9, self.ink, font="Helvetica-Bold", align="right", charspace=0.35)
            y -= 35
        x2, y2 = 525, 404
        self.text(x2, y2, "TYPE FILES", 7.6, self.pink, font="Helvetica-Bold", charspace=0.55)
        y2 -= 25
        for index, font in enumerate(self.config["fontDownloads"], start=1):
            self.c.setStrokeColor(self.ink)
            self.c.setLineWidth(0.4)
            self.c.line(x2, y2 - 7, PAGE_W - 28, y2 - 7)
            self.text(x2, y2 + 2, f"{index:02d}", 6.9, self.colors["khaki"], font="Helvetica-Bold")
            self.text(x2 + 31, y2, font["name"], 10.5, self.ink, font=self.display_font)
            self.text(PAGE_W - 28, y2 + 2, font["format"], 6.9, self.ink, font="Helvetica-Bold", align="right", charspace=0.35)
            y2 -= 42
        self.panel(x2, 175, PAGE_W - x2 - 28, 99, self.pink)
        self.text(x2 + 16, 245, "PDF", 7.2, self.ink, font="Helvetica-Bold", charspace=0.5)
        self.text(x2 + 16, 214, "OFFBEAT-BRAND-GUIDELINES.PDF", 13, self.ink, font=self.display_font)
        self.text(x2 + 16, 190, "CURRENT PORTABLE EDITION", 6.9, self.ink, font="Helvetica-Bold", charspace=0.35)
        self.panel(28, 62, PAGE_W - 56, 81, self.ink)
        self.text(44, 114, "SOURCE OF TRUTH", 7.2, self.pink, font="Helvetica-Bold", charspace=0.5)
        self.text(44, 89, "CONTENT/OFFBEAT.TS", 18, self.white, font=self.display_font, charspace=0.2)
        self.wrapped(300, 111, "Update the centralized client config, then regenerate this PDF to keep the portable edition aligned with Lore.", 465, 9.2, self.paper, font="Helvetica", leading=12.5)

    def build(self) -> None:
        self.page_cover()
        self.page_contents()
        self.page_logo_opener()
        self.page_logo_core()
        self.page_logo_rules()
        self.page_logo_assets()
        self.page_typography_opener()
        self.page_typography_system()
        self.page_typography_specimen()
        self.page_color_opener()
        self.page_palette()
        self.page_color_combinations()
        self.page_photography_placeholder()
        self.page_system_opener()
        self.page_shape_system()
        self.page_application_placeholder()
        self.page_download_index()
        if self.page_number != TOTAL_PAGES:
            raise RuntimeError(f"Expected {TOTAL_PAGES} pages, created {self.page_number}")
        self.c.save()


def main() -> None:
    TMP_ROOT.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_PATH.parent.mkdir(parents=True, exist_ok=True)
    config = load_config()
    BrandBook(config, OUTPUT_PATH).build()
    shutil.copy2(OUTPUT_PATH, PUBLIC_PATH)
    for static_font in (
        TMP_ROOT / "Archivo-Social.ttf",
        TMP_ROOT / "Archivo-Narrow-Black.ttf",
        TMP_ROOT / "Archivo-Text.ttf",
    ):
        static_font.unlink(missing_ok=True)
    print(f"Created {OUTPUT_PATH}")
    print(f"Published copy {PUBLIC_PATH}")


if __name__ == "__main__":
    main()
