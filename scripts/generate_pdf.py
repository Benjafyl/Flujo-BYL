from __future__ import annotations

import re
import sys
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, StyleSheet1, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ACCENT = colors.HexColor("#0F766E")
ACCENT_DARK = colors.HexColor("#0B3B3A")
TEXT = colors.HexColor("#18212B")
MUTED = colors.HexColor("#52606D")
PAPER = colors.HexColor("#F7FAFC")
LINE = colors.HexColor("#D9E2EC")


def register_fonts() -> tuple[str, str, str]:
    candidates = [
        (
            Path(r"C:\Windows\Fonts\segoeui.ttf"),
            Path(r"C:\Windows\Fonts\segoeuib.ttf"),
            Path(r"C:\Windows\Fonts\consola.ttf"),
            "SegoeUI",
            "SegoeUI-Bold",
            "Consolas",
        ),
        (
            Path(r"C:\Windows\Fonts\arial.ttf"),
            Path(r"C:\Windows\Fonts\arialbd.ttf"),
            Path(r"C:\Windows\Fonts\consola.ttf"),
            "Arial",
            "Arial-Bold",
            "Consolas",
        ),
    ]
    for regular, bold, mono, regular_name, bold_name, mono_name in candidates:
        if regular.exists() and bold.exists() and mono.exists():
            pdfmetrics.registerFont(TTFont(regular_name, str(regular)))
            pdfmetrics.registerFont(TTFont(bold_name, str(bold)))
            pdfmetrics.registerFont(TTFont(mono_name, str(mono)))
            return regular_name, bold_name, mono_name
    return "Helvetica", "Helvetica-Bold", "Courier"


FONT_REGULAR, FONT_BOLD, FONT_MONO = register_fonts()


def build_styles() -> StyleSheet1:
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="Body",
            fontName=FONT_REGULAR,
            fontSize=10.5,
            leading=15,
            textColor=TEXT,
            alignment=TA_JUSTIFY,
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Small",
            parent=styles["Body"],
            fontSize=8.5,
            leading=12,
            textColor=MUTED,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H1",
            fontName=FONT_BOLD,
            fontSize=20,
            leading=25,
            textColor=ACCENT_DARK,
            spaceAfter=10,
            spaceBefore=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H2",
            fontName=FONT_BOLD,
            fontSize=14.5,
            leading=19,
            textColor=ACCENT_DARK,
            spaceBefore=10,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H3",
            fontName=FONT_BOLD,
            fontSize=11.5,
            leading=15,
            textColor=TEXT,
            spaceBefore=8,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Quote",
            parent=styles["Body"],
            leftIndent=10 * mm,
            rightIndent=5 * mm,
            borderPadding=6,
            borderColor=LINE,
            borderWidth=0.8,
            borderRadius=4,
            borderLeftColor=ACCENT,
            borderLeftWidth=3,
            backColor=colors.white,
            textColor=ACCENT_DARK,
            spaceBefore=6,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyBullet",
            parent=styles["Body"],
            leftIndent=5 * mm,
            firstLineIndent=0,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CoverTitle",
            fontName=FONT_BOLD,
            fontSize=27,
            leading=32,
            textColor=colors.white,
            alignment=TA_CENTER,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CoverSubtitle",
            fontName=FONT_REGULAR,
            fontSize=12.5,
            leading=18,
            textColor=colors.white,
            alignment=TA_CENTER,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CoverMeta",
            fontName=FONT_REGULAR,
            fontSize=9.2,
            leading=12,
            textColor=colors.HexColor("#DDEEEB"),
            alignment=TA_CENTER,
        )
    )
    return styles


STYLES = build_styles()


def inline_markup(text: str) -> str:
    text = escape(text)
    text = re.sub(r"`([^`]+)`", lambda m: f'<font name="{FONT_MONO}">{m.group(1)}</font>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", text)
    text = re.sub(
        r"\[([^\]]+)\]\((https?://[^)]+)\)",
        lambda m: f'<a href="{m.group(2)}" color="#0F766E">{m.group(1)}</a>',
        text,
    )
    return text


def extract_cover(parts: list[str]) -> tuple[str, str, list[str]]:
    title = "Documento"
    subtitle_parts: list[str] = []
    body = list(parts)
    if body and body[0].startswith("# "):
        title = body.pop(0)[2:].strip()
    while body and not body[0].strip():
        body.pop(0)
    while body and body[0].startswith("> "):
        subtitle_parts.append(body.pop(0)[2:].strip())
    while body and not body[0].strip():
        body.pop(0)
    return title, " ".join(subtitle_parts), body


def flush_paragraph(buffer: list[str], story: list) -> None:
    if not buffer:
        return
    text = " ".join(part.strip() for part in buffer if part.strip())
    if text:
        story.append(Paragraph(inline_markup(text), STYLES["Body"]))
    buffer.clear()


def flush_quote(buffer: list[str], story: list) -> None:
    if not buffer:
        return
    text = " ".join(part.strip() for part in buffer if part.strip())
    if text:
        story.append(Paragraph(inline_markup(text), STYLES["Quote"]))
    buffer.clear()


def flush_list(items: list[str], story: list, ordered: bool = False) -> None:
    if not items:
        return
    flow_items = [
        ListItem(Paragraph(inline_markup(item), STYLES["BodyBullet"]), leftIndent=0)
        for item in items
    ]
    story.append(
        ListFlowable(
            flow_items,
            bulletType="1" if ordered else "bullet",
            start="1",
            leftIndent=8 * mm,
            bulletFontName=FONT_BOLD if ordered else FONT_REGULAR,
            bulletFontSize=9.5,
            bulletColor=ACCENT_DARK,
            spaceAfter=6,
        )
    )
    items.clear()


def add_cover(story: list, title: str, subtitle: str) -> None:
    hero_lines = [
        "Una sola app para registrar, clasificar y entender tu dinero.",
        "Enfoque recomendado: Next.js + Supabase + Vercel + PWA-first.",
    ]
    story.append(Spacer(1, 50 * mm))
    story.append(Paragraph(inline_markup(title), STYLES["CoverTitle"]))
    if subtitle:
        story.append(Spacer(1, 4 * mm))
        story.append(Paragraph(inline_markup(subtitle), STYLES["CoverSubtitle"]))
    story.append(Spacer(1, 10 * mm))
    story.append(Paragraph("Blueprint v1 · Uso personal · Abril 2026", STYLES["CoverMeta"]))
    story.append(Spacer(1, 18 * mm))
    card = Table(
        [[Paragraph(inline_markup(line), STYLES["CoverSubtitle"])] for line in hero_lines],
        colWidths=[150 * mm],
    )
    card.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#155E59")),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#A8D5D0")),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    story.append(card)
    story.append(PageBreak())


def parse_markdown(lines: list[str]) -> list:
    title, subtitle, body = extract_cover(lines)
    story: list = []
    add_cover(story, title, subtitle)

    paragraph_buffer: list[str] = []
    quote_buffer: list[str] = []
    unordered_items: list[str] = []
    ordered_items: list[str] = []

    def flush_all() -> None:
        flush_paragraph(paragraph_buffer, story)
        flush_quote(quote_buffer, story)
        flush_list(unordered_items, story, ordered=False)
        flush_list(ordered_items, story, ordered=True)

    for raw_line in body:
        line = raw_line.rstrip()
        stripped = line.strip()

        if not stripped:
            flush_all()
            continue

        if stripped == "---":
            flush_all()
            story.append(Spacer(1, 2 * mm))
            continue

        if stripped.startswith("# "):
            flush_all()
            story.append(Paragraph(inline_markup(stripped[2:]), STYLES["H1"]))
            continue

        if stripped.startswith("## "):
            flush_all()
            story.append(Paragraph(inline_markup(stripped[3:]), STYLES["H2"]))
            continue

        if stripped.startswith("### "):
            flush_all()
            story.append(Paragraph(inline_markup(stripped[4:]), STYLES["H3"]))
            continue

        if stripped.startswith("> "):
            flush_paragraph(paragraph_buffer, story)
            flush_list(unordered_items, story, ordered=False)
            flush_list(ordered_items, story, ordered=True)
            quote_buffer.append(stripped[2:])
            continue

        unordered_match = re.match(r"^[-*]\s+(.+)$", stripped)
        if unordered_match:
            flush_paragraph(paragraph_buffer, story)
            flush_quote(quote_buffer, story)
            flush_list(ordered_items, story, ordered=True)
            unordered_items.append(unordered_match.group(1))
            continue

        ordered_match = re.match(r"^\d+\.\s+(.+)$", stripped)
        if ordered_match:
            flush_paragraph(paragraph_buffer, story)
            flush_quote(quote_buffer, story)
            flush_list(unordered_items, story, ordered=False)
            ordered_items.append(ordered_match.group(1))
            continue

        flush_quote(quote_buffer, story)
        flush_list(unordered_items, story, ordered=False)
        flush_list(ordered_items, story, ordered=True)
        paragraph_buffer.append(stripped)

    flush_all()
    return story


def draw_first_page(canvas, doc) -> None:
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(ACCENT_DARK)
    canvas.rect(0, 0, width, height, fill=1, stroke=0)
    canvas.setFillColor(ACCENT)
    canvas.rect(0, height - 48 * mm, width, 48 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#1F4F4A"))
    canvas.circle(width - 24 * mm, 34 * mm, 18 * mm, fill=1, stroke=0)
    canvas.restoreState()


def draw_later_pages(canvas, doc) -> None:
    width, height = A4
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.4)
    canvas.line(20 * mm, height - 14 * mm, width - 20 * mm, height - 14 * mm)
    canvas.setFont(FONT_REGULAR, 8.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 10 * mm, "FLUJO BYL · Blueprint de producto y arquitectura")
    canvas.drawRightString(width - 20 * mm, 10 * mm, f"Página {doc.page}")
    canvas.restoreState()


def build_pdf(input_path: Path, output_path: Path) -> None:
    lines = input_path.read_text(encoding="utf-8").splitlines()
    story = parse_markdown(lines)
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="FLUJO BYL Blueprint",
        author="Codex",
    )
    doc.build(story, onFirstPage=draw_first_page, onLaterPages=draw_later_pages)


def main() -> int:
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("docs/flujo-byl-blueprint.md")
    output_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("output/flujo-byl-blueprint.pdf")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    build_pdf(input_path, output_path)
    print(output_path.resolve())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
