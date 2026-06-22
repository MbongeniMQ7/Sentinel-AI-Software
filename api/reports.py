"""
SentinelAI — branded report generator (Vercel Python serverless function).

POST /api/reports
Body: {
  "title":       str,                       # report title
  "subtitle":    str,                       # scope line, e.g. "All companies · FY 2026"
  "range":       str,                       # human date-range label
  "format":      "pdf" | "xlsx" | "csv",
  "generatedAt": str,                       # display timestamp
  "meta":        [[label, value], ...],     # key/value metadata rows
  "kpis":        [{"label": str, "value": str}, ...]
}

Returns the generated document as a binary download, branded with the
SentinelAI logo and the product's blue theme.
"""

import csv
import datetime
import io
import json
import os
import urllib.request
from http.server import BaseHTTPRequestHandler

from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
from reportlab.pdfgen import canvas as pdfcanvas

import xlsxwriter

# ---------------------------------------------------------------------------
# Brand system (mirrors tailwind.config.js)
# ---------------------------------------------------------------------------
APP_NAME = "SentinelAI"
TAGLINE = "Workforce Fatigue & Wellness Platform"

BRAND = "#1f43f5"
BRAND_DARK = "#1a33e1"
BRAND_LIGHT = "#eef4ff"
INK = "#0f172a"
INK_MUTED = "#475569"
INK_SUBTLE = "#94a3b8"
LINE = "#e2e8f0"
WHITE = "#ffffff"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def slugify(value: str) -> str:
    out = "".join(c.lower() if c.isalnum() else "-" for c in (value or ""))
    while "--" in out:
        out = out.replace("--", "-")
    return out.strip("-") or "report"


def png_size(data: bytes):
    """Return (width, height) for a PNG byte string, or None."""
    if data and len(data) >= 24 and data[:8] == b"\x89PNG\r\n\x1a\n":
        w = int.from_bytes(data[16:20], "big")
        h = int.from_bytes(data[20:24], "big")
        return w, h
    return None


def load_logo(host: str | None) -> bytes | None:
    """Resolve the brand logo: bundled file first, then the live deployment."""
    # 1) bundled alongside the function
    local = os.path.join(os.path.dirname(__file__), "logo.png")
    try:
        if os.path.exists(local):
            with open(local, "rb") as fh:
                return fh.read()
    except Exception:
        pass
    # 2) fetch from the deployment's public asset
    if host:
        for scheme in ("https", "http"):
            try:
                req = urllib.request.Request(
                    f"{scheme}://{host}/logo.png",
                    headers={"User-Agent": "SentinelAI-Reports"},
                )
                with urllib.request.urlopen(req, timeout=4) as resp:
                    if resp.status == 200:
                        return resp.read()
            except Exception:
                continue
    return None


def normalize(data: dict) -> dict:
    fmt = (data.get("format") or "pdf").lower()
    if fmt not in ("pdf", "xlsx", "csv"):
        fmt = "pdf"
    meta = []
    for row in data.get("meta") or []:
        if isinstance(row, (list, tuple)) and len(row) >= 2:
            meta.append((str(row[0]), str(row[1])))
    kpis = []
    for k in data.get("kpis") or []:
        if isinstance(k, dict):
            kpis.append({"label": str(k.get("label", "")), "value": str(k.get("value", ""))})
    return {
        "title": str(data.get("title") or "Report"),
        "subtitle": str(data.get("subtitle") or ""),
        "range": str(data.get("range") or ""),
        "format": fmt,
        "generatedAt": str(data.get("generatedAt") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M")),
        "meta": meta,
        "kpis": kpis,
    }


# ---------------------------------------------------------------------------
# CSV
# ---------------------------------------------------------------------------
def build_csv(p: dict):
    buf = io.StringIO()
    buf.write("\ufeff")  # BOM so Excel detects UTF-8
    w = csv.writer(buf)
    w.writerow([f"{APP_NAME} — {p['title']}"])
    if p["subtitle"]:
        w.writerow([p["subtitle"]])
    for k, v in p["meta"]:
        w.writerow([k, v])
    w.writerow([])
    w.writerow(["Metric", "Value"])
    for kpi in p["kpis"]:
        w.writerow([kpi["label"], kpi["value"]])
    return buf.getvalue().encode("utf-8"), "text/csv; charset=utf-8"


# ---------------------------------------------------------------------------
# Excel (.xlsx) — branded with xlsxwriter
# ---------------------------------------------------------------------------
def build_xlsx(p: dict, logo: bytes | None):
    out = io.BytesIO()
    wb = xlsxwriter.Workbook(out, {"in_memory": True})
    ws = wb.add_worksheet("Report")
    ws.hide_gridlines(2)
    ws.set_column("A:A", 30)
    ws.set_column("B:B", 46)

    band = wb.add_format({"bg_color": BRAND, "valign": "vcenter"})
    title_fmt = wb.add_format(
        {"bold": True, "font_size": 16, "align": "left", "valign": "vcenter", "font_color": INK}
    )
    sub_fmt = wb.add_format({"font_size": 11, "font_color": INK_MUTED, "valign": "vcenter"})
    meta_key = wb.add_format({"bold": True, "font_color": INK, "valign": "vcenter"})
    meta_val = wb.add_format({"font_color": INK_MUTED, "valign": "vcenter"})
    th = wb.add_format(
        {
            "bold": True,
            "font_color": WHITE,
            "bg_color": BRAND,
            "border": 1,
            "border_color": BRAND_DARK,
            "align": "left",
            "valign": "vcenter",
        }
    )
    td = wb.add_format({"border": 1, "border_color": LINE, "font_color": INK, "valign": "vcenter"})
    td_alt = wb.add_format(
        {"border": 1, "border_color": LINE, "bg_color": BRAND_LIGHT, "font_color": INK, "valign": "vcenter"}
    )
    val_fmt = wb.add_format({"border": 1, "border_color": LINE, "font_color": BRAND, "bold": True, "valign": "vcenter"})
    val_alt = wb.add_format(
        {"border": 1, "border_color": LINE, "bg_color": BRAND_LIGHT, "font_color": BRAND, "bold": True, "valign": "vcenter"}
    )
    foot_fmt = wb.add_format({"font_color": INK_SUBTLE, "italic": True, "font_size": 9})

    # Brand band + logo + wordmark
    ws.set_row(0, 50)
    ws.merge_range("A1:B1", "", band)
    text_offset = 14
    if logo:
        size = png_size(logo)
        scale = (34.0 / size[1]) if size else 0.06
        try:
            ws.insert_image(
                "A1",
                "logo.png",
                {
                    "image_data": io.BytesIO(logo),
                    "x_scale": scale,
                    "y_scale": scale,
                    "x_offset": 12,
                    "y_offset": 8,
                    "object_position": 3,
                },
            )
            text_offset = 56
        except Exception:
            text_offset = 14
    ws.insert_textbox(
        "A1",
        APP_NAME,
        {
            "width": 220,
            "height": 26,
            "x_offset": text_offset,
            "y_offset": 12,
            "font": {"color": WHITE, "bold": True, "size": 15},
            "fill": {"none": True},
            "line": {"none": True},
            "align": {"vertical": "middle"},
        },
    )

    row = 2
    ws.merge_range(row, 0, row, 1, p["title"], title_fmt)
    ws.set_row(row, 24)
    row += 1
    scope = " · ".join([s for s in (p["subtitle"], p["range"]) if s])
    if scope:
        ws.merge_range(row, 0, row, 1, scope, sub_fmt)
        row += 1
    row += 1

    for k, v in p["meta"]:
        ws.write(row, 0, k, meta_key)
        ws.write(row, 1, v, meta_val)
        row += 1
    row += 1

    ws.write(row, 0, "Metric", th)
    ws.write(row, 1, "Value", th)
    row += 1
    for i, kpi in enumerate(p["kpis"]):
        alt = i % 2 == 1
        ws.write(row, 0, kpi["label"], td_alt if alt else td)
        ws.write(row, 1, kpi["value"], val_alt if alt else val_fmt)
        row += 1
    row += 1
    ws.write(row, 0, f"Generated by {APP_NAME} on {p['generatedAt']}", foot_fmt)

    wb.close()
    out.seek(0)
    return out.read(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


# ---------------------------------------------------------------------------
# PDF — branded with reportlab
# ---------------------------------------------------------------------------
def build_pdf(p: dict, logo: bytes | None):
    out = io.BytesIO()
    W, H = A4
    c = pdfcanvas.Canvas(out, pagesize=A4)
    c.setTitle(f"{APP_NAME} — {p['title']}")

    brand = colors.HexColor(BRAND)
    ink = colors.HexColor(INK)
    ink_muted = colors.HexColor(INK_MUTED)
    ink_subtle = colors.HexColor(INK_SUBTLE)
    line = colors.HexColor(LINE)
    brand_light = colors.HexColor(BRAND_LIGHT)

    # ---- Header band ----
    band_h = 96
    c.setFillColor(brand)
    c.rect(0, H - band_h, W, band_h, stroke=0, fill=1)

    # logo chip (white) + logo
    chip = 46
    chip_x, chip_y = 40, H - band_h + (band_h - chip) / 2
    c.setFillColor(colors.white)
    c.roundRect(chip_x, chip_y, chip, chip, 10, stroke=0, fill=1)
    if logo:
        try:
            img = ImageReader(io.BytesIO(logo))
            iw, ih = img.getSize()
            box = chip - 12
            s = min(box / iw, box / ih)
            dw, dh = iw * s, ih * s
            c.drawImage(
                img,
                chip_x + (chip - dw) / 2,
                chip_y + (chip - dh) / 2,
                dw,
                dh,
                mask="auto",
            )
        except Exception:
            pass

    text_x = chip_x + chip + 16
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 21)
    c.drawString(text_x, H - band_h / 2 + 4, APP_NAME)
    c.setFont("Helvetica", 9)
    c.drawString(text_x, H - band_h / 2 - 12, TAGLINE)

    # ---- Title block ----
    y = H - band_h - 40
    c.setFillColor(ink)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(40, y, p["title"])
    y -= 18
    scope = " · ".join([s for s in (p["subtitle"], p["range"]) if s])
    if scope:
        c.setFillColor(ink_muted)
        c.setFont("Helvetica", 11)
        c.drawString(40, y, scope)
        y -= 8

    # ---- Meta rows ----
    y -= 22
    for k, v in p["meta"]:
        c.setFillColor(ink)
        c.setFont("Helvetica-Bold", 9.5)
        c.drawString(40, y, k)
        c.setFillColor(ink_muted)
        c.setFont("Helvetica", 9.5)
        c.drawString(150, y, v)
        y -= 16

    # ---- KPI cards ----
    y -= 14
    kpis = p["kpis"]
    cols = 3
    gap = 12
    card_w = (W - 80 - gap * (cols - 1)) / cols
    card_h = 70
    for i, kpi in enumerate(kpis):
        col = i % cols
        if col == 0 and i > 0:
            y -= card_h + gap
        x = 40 + col * (card_w + gap)
        c.setFillColor(brand_light)
        c.setStrokeColor(line)
        c.setLineWidth(1)
        c.roundRect(x, y - card_h, card_w, card_h, 12, stroke=1, fill=1)
        c.setFillColor(brand)
        c.setFont("Helvetica-Bold", 20)
        c.drawString(x + 16, y - 34, kpi["value"][:18])
        c.setFillColor(ink_muted)
        c.setFont("Helvetica", 9)
        c.drawString(x + 16, y - 52, kpi["label"][:26])
    if kpis:
        y -= card_h + gap

    # ---- Footer ----
    c.setStrokeColor(line)
    c.setLineWidth(1)
    c.line(40, 60, W - 40, 60)
    c.setFillColor(ink_subtle)
    c.setFont("Helvetica", 9)
    c.drawString(40, 46, f"Generated by {APP_NAME} on {p['generatedAt']}")
    c.drawRightString(W - 40, 46, f"© {datetime.date.today().year} {APP_NAME}")

    c.showPage()
    c.save()
    out.seek(0)
    return out.read(), "application/pdf"


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------
class handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("content-length", 0) or 0)
            raw = self.rfile.read(length) if length else b"{}"
            data = json.loads(raw or b"{}")
        except Exception:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(b'{"error":"Invalid request body"}')
            return

        p = normalize(data)
        fmt = p["format"]
        logo = load_logo(self.headers.get("host")) if fmt in ("pdf", "xlsx") else None

        try:
            if fmt == "csv":
                content, mime = build_csv(p)
                ext = "csv"
            elif fmt == "xlsx":
                content, mime = build_xlsx(p, logo)
                ext = "xlsx"
            else:
                content, mime = build_pdf(p, logo)
                ext = "pdf"
        except Exception as exc:  # pragma: no cover
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self._cors()
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(exc)}).encode("utf-8"))
            return

        filename = f"{slugify(p['title'])}-{datetime.date.today().isoformat()}.{ext}"
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
        self.send_header("Content-Length", str(len(content)))
        self._cors()
        self.end_headers()
        self.wfile.write(content)
