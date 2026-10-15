#!/usr/bin/env python3
"""Render a readable, branded PDF companion for a package Markdown guide."""

from __future__ import annotations

import argparse
import re
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

NAVY = colors.HexColor("#091533")
CYAN = colors.HexColor("#00ACED")
INK = colors.HexColor("#17233F")
MUTED = colors.HexColor("#65708A")
PALE = colors.HexColor("#EEF5FC")


def inline_markup(text: str) -> str:
    value = re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", text)
    code: list[str] = []

    def hold_code(match):
        code.append(match.group(1))
        return f"@@CODE{len(code) - 1}@@"

    value = escape(re.sub(r"`([^`]+)`", hold_code, value))
    value = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", value)
    value = re.sub(r"(?<!_)_([^_]+)_(?!_)", r"<i>\1</i>", value)
    for index, snippet in enumerate(code):
        value = value.replace(f"@@CODE{index}@@", f'<font name="Courier" color="#0077A8">{escape(snippet)}</font>')
    return value.replace("—", "- ").replace("·", "| ").replace("×", "x").replace("→", " / ")


def build_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("GuideTitle", parent=base["Title"], fontName="Helvetica-Bold", fontSize=25, leading=30, textColor=colors.white, alignment=TA_LEFT, spaceAfter=0),
        "subtitle": ParagraphStyle("GuideSubtitle", parent=base["Normal"], fontName="Helvetica", fontSize=9, leading=13, textColor=colors.HexColor("#D5E9F7")),
        "h2": ParagraphStyle("GuideH2", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=NAVY, spaceBefore=14, spaceAfter=6, keepWithNext=True),
        "h3": ParagraphStyle("GuideH3", parent=base["Heading3"], fontName="Helvetica-Bold", fontSize=11, leading=14, textColor=colors.HexColor("#007AA8"), spaceBefore=9, spaceAfter=4, keepWithNext=True),
        "body": ParagraphStyle("GuideBody", parent=base["BodyText"], fontName="Helvetica", fontSize=9, leading=13, textColor=INK, spaceAfter=6),
        "bullet": ParagraphStyle("GuideBullet", parent=base["BodyText"], fontName="Helvetica", fontSize=9, leading=13, textColor=INK, leftIndent=14, firstLineIndent=-9, spaceAfter=3),
        "code": ParagraphStyle("GuideCode", parent=base["Code"], fontName="Courier", fontSize=7.5, leading=10, textColor=INK, backColor=PALE, borderPadding=7, spaceBefore=4, spaceAfter=8),
        "table": ParagraphStyle("GuideTable", parent=base["BodyText"], fontName="Helvetica", fontSize=7.4, leading=9.3, textColor=INK),
        "tablehead": ParagraphStyle("GuideTableHead", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=7.4, leading=9.3, textColor=colors.white),
    }


def parse_markdown(source: str, styles: dict[str, ParagraphStyle]):
    lines = source.splitlines()
    flowables = []
    if lines and lines[0].startswith("# "):
        title = lines.pop(0)[2:].strip()
        while lines and not lines[0].strip():
            lines.pop(0)
        subtitle = lines.pop(0).strip("_ ") if lines and lines[0].startswith("_") else "OBS package setup guide"
        banner = Table([[Paragraph(inline_markup(title), styles["title"])], [Paragraph(inline_markup(subtitle), styles["subtitle"])]], colWidths=[6.75 * inch])
        banner.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), NAVY), ("BOX", (0, 0), (-1, -1), 0, NAVY),
            ("LEFTPADDING", (0, 0), (-1, -1), 18), ("RIGHTPADDING", (0, 0), (-1, -1), 18),
            ("TOPPADDING", (0, 0), (-1, 0), 17), ("BOTTOMPADDING", (0, 0), (-1, 0), 4),
            ("TOPPADDING", (0, 1), (-1, 1), 2), ("BOTTOMPADDING", (0, 1), (-1, 1), 17),
        ]))
        flowables += [Spacer(1, 0.15 * inch), banner, Spacer(1, 0.12 * inch)]

    in_code = False
    code_lines: list[str] = []
    table_rows: list[list[str]] = []

    def flush_table():
        nonlocal table_rows
        if not table_rows:
            return
        rows = [[Paragraph(inline_markup(cell), styles["tablehead"] if i == 0 else styles["table"]) for cell in row] for i, row in enumerate(table_rows)]
        columns = max(map(len, rows))
        width = 6.75 * inch / columns
        table = Table(rows, colWidths=[width] * columns, repeatRows=1, hAlign="LEFT")
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PALE]),
            ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D6E0ED")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5), ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        flowables.extend([table, Spacer(1, 0.1 * inch)])
        table_rows = []

    for line in lines:
        if line.strip().startswith("```"):
            flush_table()
            if in_code:
                flowables.append(Paragraph(escape("\n".join(code_lines)).replace("\n", "<br/>"), styles["code"]))
                code_lines = []
            in_code = not in_code
            continue
        if in_code:
            code_lines.append(line)
            continue
        if line.startswith("|") and line.endswith("|"):
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            if all(re.fullmatch(r"[-: ]+", cell or " ") for cell in cells):
                continue
            table_rows.append(cells)
            continue
        flush_table()
        if line.startswith("## "):
            flowables.append(Paragraph(inline_markup(line[3:]), styles["h2"]))
        elif line.startswith("### "):
            flowables.append(Paragraph(inline_markup(line[4:]), styles["h3"]))
        elif line.startswith("- "):
            flowables.append(Paragraph("&#8226; " + inline_markup(line[2:]), styles["bullet"]))
        elif re.match(r"\d+\. ", line):
            number, text = line.split(". ", 1)
            flowables.append(Paragraph(f"<b>{number}.</b> " + inline_markup(text), styles["bullet"]))
        elif line.strip() and not line.startswith("# "):
            flowables.append(Paragraph(inline_markup(line), styles["body"]))
        elif not line.strip():
            flowables.append(Spacer(1, 0.025 * inch))
    flush_table()
    return flowables


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("markdown", type=Path)
    parser.add_argument("pdf", type=Path)
    args = parser.parse_args()
    args.pdf.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(str(args.pdf), pagesize=letter, rightMargin=0.88 * inch, leftMargin=0.88 * inch, topMargin=0.78 * inch, bottomMargin=0.7 * inch, title=args.markdown.stem)
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="content")

    def decorate(canvas, document):
        canvas.saveState()
        canvas.setFillColor(colors.white)
        canvas.rect(0, 0, letter[0], letter[1], fill=1, stroke=0)
        canvas.setFillColor(NAVY)
        canvas.rect(0, letter[1] - 0.22 * inch, letter[0], 0.22 * inch, fill=1, stroke=0)
        canvas.setFillColor(CYAN)
        canvas.rect(0, letter[1] - 0.22 * inch, 0.12 * inch, 0.22 * inch, fill=1, stroke=0)
        canvas.setFont("Helvetica-Bold", 7.5)
        canvas.setFillColor(MUTED)
        canvas.drawString(doc.leftMargin, 0.38 * inch, "MRDEMONWOLF  |  OBS SETUP")
        canvas.drawRightString(letter[0] - doc.rightMargin, 0.38 * inch, f"{document.page}")
        canvas.restoreState()

    doc.addPageTemplates([PageTemplate(id="guide", frames=[frame], onPage=decorate)])
    doc.build(parse_markdown(args.markdown.read_text(encoding="utf-8"), build_styles()))
    print(f"✓ PDF guide: {args.pdf}")


if __name__ == "__main__":
    main()
