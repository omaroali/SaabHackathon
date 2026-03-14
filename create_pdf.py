#!/usr/bin/env python3
"""Generate the AirBase Ops pitch deck as a landscape PDF."""

from reportlab.lib.pagesizes import landscape
from reportlab.lib.units import inch, mm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# ── Page Setup ───────────────────────────────────────
W, H = landscape((13.333 * inch, 7.5 * inch))
OUTPUT = "/Users/omarali/Web/SaabHackathon/AirBaseOps_Pitch.pdf"

# ── Colors ───────────────────────────────────────────
BG       = HexColor("#0F172A")
BG_CARD  = HexColor("#16203A")
ACCENT   = HexColor("#3B82F6")
CYAN     = HexColor("#22D3EE")
GREEN    = HexColor("#22C55E")
ORANGE   = HexColor("#F97316")
RED      = HexColor("#EF4444")
YELLOW   = HexColor("#FACC15")
WHITE    = HexColor("#FFFFFF")
LIGHT    = HexColor("#CBD5E1")
MUTED    = HexColor("#94A3B8")
DARK_ROW = HexColor("#1E293B")

TOTAL = 12

# ── Helpers ──────────────────────────────────────────
def bg(c):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)

def accent_bar_top(c, color=ACCENT):
    c.setFillColor(color)
    c.rect(0, H - 4, W, 4, fill=1, stroke=0)

def slide_num(c, n):
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9)
    c.drawRightString(W - 40, 25, f"{n}/{TOTAL}")

def card(c, x, y, w, h, accent_color=None, accent_side=None):
    """Draw a card. y is TOP of card (PDF coords: bottom-up, so we convert)."""
    c.setFillColor(BG_CARD)
    c.rect(x, y - h, w, h, fill=1, stroke=0)
    if accent_color and accent_side != "left":
        c.setFillColor(accent_color)
        c.rect(x, y, w, 4, fill=1, stroke=0)
    if accent_color and accent_side == "left":
        c.setFillColor(accent_color)
        c.rect(x, y - h, 5, h, fill=1, stroke=0)

def text(c, x, y, txt, size=16, color=WHITE, bold=False, font=None):
    if font is None:
        font = "Helvetica-Bold" if bold else "Helvetica"
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawString(x, y, txt)

def text_center(c, x, y, w, txt, size=16, color=WHITE, bold=False):
    font = "Helvetica-Bold" if bold else "Helvetica"
    c.setFillColor(color)
    c.setFont(font, size)
    tw = c.stringWidth(txt, font, size)
    c.drawString(x + (w - tw) / 2, y, txt)

def text_right(c, x, y, txt, size=16, color=WHITE, bold=False):
    font = "Helvetica-Bold" if bold else "Helvetica"
    c.setFillColor(color)
    c.setFont(font, size)
    c.drawRightString(x, y, txt)

def wrapped_text(c, x, y, w, txt, size=12, color=LIGHT, bold=False, leading=None):
    """Simple word-wrap text block. Returns y position after last line."""
    font = "Helvetica-Bold" if bold else "Helvetica"
    if leading is None:
        leading = size * 1.4
    c.setFillColor(color)
    c.setFont(font, size)
    words = txt.split()
    lines = []
    current = ""
    for word in words:
        test = f"{current} {word}".strip()
        if c.stringWidth(test, font, size) <= w:
            current = test
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    cy = y
    for line in lines:
        c.drawString(x, cy, line)
        cy -= leading
    return cy

def dot(c, x, y, r, color):
    c.setFillColor(color)
    c.circle(x, y, r, fill=1, stroke=0)

def accent_bar_left(c, x, y, h, color=ACCENT, w=5):
    c.setFillColor(color)
    c.rect(x, y, w, h, fill=1, stroke=0)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
c = canvas.Canvas(OUTPUT, pagesize=(W, H))
c.setTitle("AirBase Ops — Pitch Deck")
c.setAuthor("AirBase Ops Team")

# ── SLIDE 1: Title ───────────────────────────────────
bg(c)
accent_bar_top(c)

text_center(c, 0, H * 0.68, W, "AIRBASE OPS", size=56, bold=True)
text_center(c, 0, H * 0.58, W, "AI-Powered Air Base Operations Simulator", size=26, color=CYAN)
text_center(c, 0, H * 0.50, W,
            "Digitizing Saab's logistics training game with real-time AI decision support",
            size=16, color=LIGHT)

card(c, 0, 65, W, 65)
text_center(c, 0, 30, W,
            "Saab Smart Air Base Hackathon  |  March 2026  |  Tekniska Museet, Stockholm",
            size=12, color=MUTED)

slide_num(c, 1)
c.showPage()

# ── SLIDE 2: The Problem ─────────────────────────────
bg(c)
accent_bar_top(c)

text(c, 55, H - 50, "THE PROBLEM", size=12, color=ACCENT, bold=True)
text(c, 55, H - 85, "Air superiority is decided on the ground", size=34, bold=True)
wrapped_text(c, 55, H - 115, W - 110,
             "Sweden's dispersed air base commanders train with paper cards, physical dice, and whiteboard schedules.",
             size=16, color=LIGHT)

pains = [
    ("Requires 8-15 people in one room", "Training happens 2-3 times per year"),
    ("Manual dice rolls & paper tracking", "A single game-day takes 4-8 real hours"),
    ("No data capture whatsoever", "Decisions evaporate after the session"),
    ("No 'what-if' capability", "Commanders can't explore alternatives mid-game"),
    ("No AI decision support", "Learning only from experienced mentors"),
    ("Single-player impossible", "Individuals can't practice on their own"),
]

for i, (title, desc) in enumerate(pains):
    col = 0 if i < 3 else 1
    row = i % 3
    x = 55 + col * 450
    y = H - 195 - row * 90
    accent_bar_left(c, x, y - 10, 55, RED)
    text(c, x + 15, y + 25, title, size=15, bold=True)
    text(c, x + 15, y + 5, desc, size=12, color=MUTED)

card(c, 40, 70, W - 80, 50)
text_center(c, 40, 42, W - 80,
            "\"The bottleneck won't be aircraft — it will be the ground crews and logistics commanders.\"",
            size=13, color=CYAN)

slide_num(c, 2)
c.showPage()

# ── SLIDE 3: The Users ───────────────────────────────
bg(c)
accent_bar_top(c)

text(c, 55, H - 50, "THE USERS", size=12, color=ACCENT, bold=True)
text(c, 55, H - 85, "Who uses this and what do they need?", size=34, bold=True)

users = [
    ("Basbatchef", "Base Commander",
     ["Translates Air Tasking Orders", "into ground-level decisions.", "Manages the big picture."], ACCENT),
    ("Underhallsberedare", "Maintenance Planner",
     ["Allocates aircraft to tasks,", "plans repair schedules,", "manages exchange units."], CYAN),
    ("Klargoringstropp", "Preparation Crews",
     ["Execute fueling, arming,", "pre-flight checks. Work", "8-hour rotating shifts."], GREEN),
]

for i, (swe, eng, desc_lines, color) in enumerate(users):
    x = 55 + i * 310
    y = H - 140
    card(c, x, y, 280, 280, color)
    text(c, x + 20, y - 35, swe, size=18, bold=True, color=color)
    text(c, x + 20, y - 60, eng, size=12, color=MUTED)
    for j, line in enumerate(desc_lines):
        text(c, x + 20, y - 95 - j * 20, line, size=13, color=LIGHT)

card(c, 40, 90, W - 80, 70)
text_center(c, 40, 65, W - 80, "SHARED GOAL", size=10, color=ACCENT, bold=True)
text_center(c, 40, 45, W - 80,
            "Maximize sortie generation across a 30-day campaign escalating from peace to crisis to war.",
            size=14, color=WHITE)

slide_num(c, 3)
c.showPage()

# ── SLIDE 4: Our Solution ────────────────────────────
bg(c)
accent_bar_top(c)

text(c, 55, H - 50, "OUR SOLUTION", size=12, color=ACCENT, bold=True)
text(c, 55, H - 85, "AirBase Ops — AI-Powered Digital Twin", size=34, bold=True)
wrapped_text(c, 55, H - 115, W - 110,
             "We digitized Saab's physical logistics board game, then augmented it with AI that transforms training into decision support.",
             size=15, color=LIGHT)

layers = [
    ("FRONTEND", "React 19 + Tailwind CSS\n+ Leaflet Maps", ACCENT,
     ["3-column ops layout", "Interactive tactical map", "Real-time KPI dashboard", "AI recommendation cards"]),
    ("BACKEND", "FastAPI + Python 3.11\n+ Pydantic v2", CYAN,
     ["Turn engine (hourly sim)", "Resource manager (7 types)", "Maintenance system (dice)", "30-day campaign scenarios"]),
    ("AI ENGINE", "OpenRouter LLM +\nDeterministic Fallback", GREEN,
     ["Structured recommendations", "Mission allocation optimizer", "Conversational advisor", "Offline deterministic planner"]),
]

for i, (label, tech, color, items) in enumerate(layers):
    x = 55 + i * 310
    y = H - 160
    card(c, x, y, 280, 195, color)
    text(c, x + 20, y - 25, label, size=12, bold=True, color=color)
    text(c, x + 20, y - 45, tech.split("\n")[0], size=12, color=LIGHT)
    if "\n" in tech:
        text(c, x + 20, y - 60, tech.split("\n")[1], size=12, color=LIGHT)
    start_y = y - 85
    for j, item in enumerate(items):
        text(c, x + 25, start_y - j * 22, f"  {item}", size=11, color=MUTED)

# Value props
props = [
    ("10 Gripen E", "Full fleet simulation", ACCENT),
    ("30-Day Campaign", "Peace > Crisis > War", ORANGE),
    ("4 Real-Time KPIs", "Readiness, throughput, delay, risk", GREEN),
    ("AI Decision Support", "Explainable recommendations", CYAN),
]

for i, (title, desc, color) in enumerate(props):
    x = 55 + i * 235
    y = 145
    card(c, x, y, 215, 100, accent_side="left", accent_color=color)
    text(c, x + 18, y - 30, title, size=14, bold=True, color=color)
    text(c, x + 18, y - 55, desc, size=11, color=LIGHT)

slide_num(c, 4)
c.showPage()

# ── SLIDE 5: Fleet Ops & Tactical Map ────────────────
bg(c)
accent_bar_top(c)

text(c, 55, H - 50, "FEATURE SPOTLIGHT", size=12, color=ACCENT, bold=True)
text(c, 55, H - 85, "Fleet Operations & Tactical Map", size=34, bold=True)

# Left card
lx, ly = 55, H - 130
card(c, lx, ly, 430, 350, ACCENT)
text(c, lx + 20, ly - 25, "FLEET OPERATIONS BOARD", size=12, bold=True, color=ACCENT)

fleet_items = [
    ("Real-time fleet overview", "All 10 aircraft visible at a glance with color-coded status"),
    ("Aircraft detail cards", "Click any aircraft for fuel, weapons, service hours, maintenance"),
    ("Assign to missions", "Assign aircraft to missions directly from the fleet view"),
    ("Status indicators", "Green=ready  Blue=flying  Yellow=prepping  Red=maintenance"),
    ("Fuel level bars", "Visual fuel gauges updated every turn"),
    ("Service hour tracking", "Remaining hours until scheduled maintenance"),
]

for i, (title, desc) in enumerate(fleet_items):
    yy = ly - 60 - i * 48
    text(c, lx + 25, yy, title, size=13, bold=True)
    text(c, lx + 25, yy - 18, desc, size=10, color=MUTED)

# Right card
rx = 510
card(c, rx, ly, 430, 350, GREEN)
text(c, rx + 20, ly - 25, "INTERACTIVE TACTICAL MAP", size=12, bold=True, color=GREEN)

map_items = [
    ("Leaflet.js interactive map", "Pan, zoom, and inspect the operational theater"),
    ("Base location indicator", "F 17 Kallinge shown with breathing glow effect"),
    ("Mission zones", "Color-coded circles: QRA (red), DCA (orange), RECCE (yellow)"),
    ("Aircraft positions", "Live markers showing aircraft locations and flight tracks"),
    ("Click-to-inspect", "Click any mission zone or aircraft for detailed information"),
    ("Auto-zoom", "Camera automatically fits all active missions and routes"),
]

for i, (title, desc) in enumerate(map_items):
    yy = ly - 60 - i * 48
    text(c, rx + 25, yy, title, size=13, bold=True)
    text(c, rx + 25, yy - 18, desc, size=10, color=MUTED)

slide_num(c, 5)
c.showPage()

# ── SLIDE 6: AI Decision Support ─────────────────────
bg(c)
accent_bar_top(c)

text(c, 55, H - 50, "CORE INNOVATION", size=12, color=ACCENT, bold=True)
text(c, 55, H - 85, "AI That Explains Its Reasoning", size=34, bold=True)
wrapped_text(c, 55, H - 115, W - 110,
             "Three layers of AI intelligence — from structured recommendations to free-form conversation.",
             size=15, color=LIGHT)

ai_layers = [
    ("1", "Recommendation Cards", ACCENT, "Structured, actionable suggestions", [
        "Aircraft-to-mission assignments",
        "Bullet-point reasoning",
        "Expected effects on 4 KPIs",
        "Confidence score (0-100%)",
        "Stated assumptions & tradeoffs",
        "One-click 'Apply All' execution",
    ]),
    ("2", "Compare Mode", CYAN, "Non-destructive 6-hour simulation", [
        "Your Plan vs AI-Optimized",
        "Missions, readiness, fuel, risk",
        "Green/red deltas for each metric",
        "Learn through comparison",
        "Zero risk — state unchanged",
        "Builds trust in AI advice",
    ]),
    ("3", "Chat Advisor", GREEN, "Natural language Q&A", [
        "\"Assess readiness\" — fleet briefing",
        "\"Fuel forecast\" — burn projection",
        "\"Maint priorities\" — repair order",
        "Swedish military terminology",
        "References specific aircraft IDs",
        "Context-aware across phases",
    ]),
]

for i, (num, title, color, subtitle, bullets) in enumerate(ai_layers):
    x = 55 + i * 310
    y = H - 155
    card(c, x, y, 280, 310, color)
    # Number badge
    c.setFillColor(color)
    c.roundRect(x + 15, y - 40, 30, 30, 4, fill=1, stroke=0)
    text(c, x + 24, y - 35, num, size=16, bold=True, color=BG)
    text(c, x + 55, y - 35, title, size=16, bold=True, color=color)
    text(c, x + 20, y - 65, subtitle, size=11, color=MUTED)
    for j, bullet in enumerate(bullets):
        text(c, x + 25, y - 95 - j * 32, f"  {bullet}", size=11, color=LIGHT)

slide_num(c, 6)
c.showPage()

# ── SLIDE 7: KPIs ────────────────────────────────────
bg(c)
accent_bar_top(c)

text(c, 55, H - 50, "METRICS-DRIVEN DECISIONS", size=12, color=ACCENT, bold=True)
text(c, 55, H - 85, "4 Real-Time KPIs — Always Visible", size=34, bold=True)
wrapped_text(c, 55, H - 115, W - 110,
             "Every decision shows immediate impact. Green arrows for improvements, red for degradation.",
             size=15, color=LIGHT)

kpis = [
    ("Fleet Readiness", "78%", GREEN,
     "Mission-capable + flying aircraft as percentage of total fleet",
     "(CAPABLE + ON_MISSION) / TOTAL"),
    ("Mission Throughput", "5", ACCENT,
     "Missions completable in the next 6 hours given current fleet",
     "Available + returning + prepping"),
    ("Turnaround Delay", "142 min", ORANGE,
     "Average minutes until non-ready aircraft become mission-capable",
     "Weighted avg of remaining hours"),
    ("Risk Score", "28", RED,
     "Composite index: fuel, UE, maintenance burden, mission gaps",
     "4 components x 25 pts each"),
]

for i, (title, value, color, desc, formula) in enumerate(kpis):
    x = 40 + i * 235
    y = H - 155
    card(c, x, y, 215, 310, color)
    text(c, x + 15, y - 30, title, size=14, bold=True, color=color)
    text(c, x + 15, y - 80, value, size=44, bold=True)
    text(c, x + 15, y - 105, "+12% from last turn", size=10, color=GREEN)
    wrapped_text(c, x + 15, y - 135, 185, desc, size=11, color=LIGHT, leading=16)
    # Formula box
    c.setFillColor(DARK_ROW)
    c.rect(x + 10, y - 295, 195, 35, fill=1, stroke=0)
    text(c, x + 18, y - 282, formula, size=9, color=MUTED)

slide_num(c, 7)
c.showPage()

# ── SLIDE 8: Faithful Digitization ───────────────────
bg(c)
accent_bar_top(c)

text(c, 55, H - 50, "FAITHFUL DIGITIZATION", size=12, color=ACCENT, bold=True)
text(c, 55, H - 85, "Every Board Game Mechanic — Digitized", size=34, bold=True)

# Left — Aircraft States
lx = 55
ly = H - 125
card(c, lx, ly, 430, 350, CYAN)
text(c, lx + 20, ly - 25, "AIRCRAFT LIFECYCLE STATE MACHINE", size=12, bold=True, color=CYAN)

states = [
    ("HANGAR", "Not prepared", MUTED),
    ("PRE_FLIGHT", "4h prep, 1/3 fault chance", YELLOW),
    ("MISSION_CAPABLE", "Ready to fly", GREEN),
    ("ON_MISSION", "Currently flying", ACCENT),
    ("POST_FLIGHT", "6h, 50% maintenance chance", ORANGE),
    ("MAINTENANCE", "2-16h repair time", RED),
]

for i, (state, desc, color) in enumerate(states):
    yy = ly - 60 - i * 42
    dot(c, lx + 30, yy + 4, 7, color)
    text(c, lx + 50, yy, state, size=12, bold=True, font="Courier-Bold")
    text(c, lx + 220, yy, desc, size=11, color=MUTED)

text_center(c, lx, ly - 335, 430,
            "HANGAR > PRE_FLIGHT > CAPABLE > MISSION > POST > HANGAR",
            size=9, color=CYAN, bold=True)

# Right — Resources
rx = 510
card(c, rx, ly, 430, 350, ORANGE)
text(c, rx + 20, ly - 25, "COMPLETE RESOURCE SIMULATION", size=12, bold=True, color=ORANGE)

resources = [
    ("Fuel Storage", "180,000L", "200L/flight-hr + 50L takeoff"),
    ("Missiles", "180 units", "10-100% lost per mission"),
    ("Bombs", "120 units", "Mission-type dependent"),
    ("Recon Pods", "10 units", "Required for RECCE"),
    ("Spare Parts", "60 units", "Consumed by maintenance"),
    ("Exchange Units", "16 units", "30-day MRO cycle"),
    ("Maint. Crews", "6 (3 on duty)", "8-hour rotating shifts"),
]

for i, (name, amt, consumption) in enumerate(resources):
    yy = ly - 60 - i * 38
    text(c, rx + 20, yy, name, size=12, bold=True)
    text(c, rx + 165, yy, amt, size=12, color=CYAN)
    text(c, rx + 270, yy, consumption, size=10, color=MUTED)

# Campaign phases
text(c, rx + 20, ly - 340, "CAMPAIGN:", size=10, bold=True, color=ORANGE)
phases = [("Days 1-10: PEACE", GREEN), ("Days 11-20: CRISIS", YELLOW), ("Days 21-30: WAR", RED)]
px = rx + 120
for label, color in phases:
    c.setFillColor(color)
    c.roundRect(px, ly - 347, 95, 20, 3, fill=1, stroke=0)
    text(c, px + 5, ly - 342, label, size=8, bold=True, color=BG)
    px += 105

slide_num(c, 8)
c.showPage()

# ── SLIDE 9: Before vs After ─────────────────────────
bg(c)
accent_bar_top(c)

text(c, 55, H - 50, "TRANSFORMATION", size=12, color=ACCENT, bold=True)
text(c, 55, H - 85, "Board Game vs AirBase Ops", size=34, bold=True)

# Table header
hy = H - 135
c.setFillColor(BG_CARD)
c.rect(55, hy - 5, 250, 30, fill=1, stroke=0)
c.setFillColor(HexColor("#3B1818"))
c.rect(315, hy - 5, 310, 30, fill=1, stroke=0)
c.setFillColor(HexColor("#0C2D1E"))
c.rect(635, hy - 5, 310, 30, fill=1, stroke=0)

text(c, 70, hy + 5, "DIMENSION", size=11, bold=True, color=MUTED)
text(c, 330, hy + 5, "PHYSICAL BOARD GAME", size=11, bold=True, color=RED)
text(c, 650, hy + 5, "AIRBASE OPS", size=11, bold=True, color=GREEN)

comparisons = [
    ("Players needed", "8-15 people", "1+ (solo or team)"),
    ("Session setup", "Hours of preparation", "Click and play in seconds"),
    ("Game speed", "4-8 hours per game day", "Real-time, adjustable speed"),
    ("Decision support", "Human mentors only", "AI advisor + what-if sim"),
    ("Data capture", "None", "Full decision audit trail"),
    ("Availability", "Scheduled events only", "24/7, any browser"),
    ("Scalability", "1 session at a time", "Unlimited concurrent"),
    ("What-if analysis", "Impossible", "Compare Mode with 6h forecast"),
]

for i, (dim, old, new) in enumerate(comparisons):
    yy = hy - 45 - i * 40
    if i % 2 == 0:
        c.setFillColor(BG_CARD)
        c.rect(55, yy - 10, 890, 35, fill=1, stroke=0)
    text(c, 70, yy, dim, size=14, bold=True)
    text(c, 330, yy, old, size=14, color=RED)
    text(c, 650, yy, new, size=14, color=GREEN)

slide_num(c, 9)
c.showPage()

# ── SLIDE 10: Business Case ──────────────────────────
bg(c)
accent_bar_top(c)

text(c, 55, H - 50, "BUSINESS CASE", size=12, color=ACCENT, bold=True)
text(c, 55, H - 85, "Why Invest in This Product?", size=34, bold=True)

biz = [
    ("Training Scalability", ACCENT,
     ["Physical: 1 session, 1 room, 8+ people",
      "AirBase Ops: Unlimited, any browser, solo/team",
      "Training frequency: 2x/year to continuous"]),
    ("Customer Value Amplifier", GREEN,
     ["Every Gripen customer needs base ops training",
      "Package with aircraft sales as differentiator",
      "Strengthens Saab's total support offering"]),
    ("Data-Driven Insights", CYAN,
     ["Every decision logged with timestamps",
      "After-action review and analytics",
      "Compare cohort performance over time"]),
]

for i, (title, color, lines) in enumerate(biz):
    x = 55 + i * 310
    y = H - 125
    card(c, x, y, 280, 170, color)
    text(c, x + 20, y - 30, title, size=15, bold=True, color=color)
    for j, line in enumerate(lines):
        text(c, x + 20, y - 60 - j * 22, line, size=11, color=LIGHT)

biz2 = [
    ("AI Augmentation Path", ORANGE,
     ["Today: Training tool with AI suggestions",
      "Tomorrow: Operational decision support",
      "Same engine, real fleet data instead of sim"]),
    ("Edge Deployment Ready", YELLOW,
     ["Python + React = lightweight, standard stack",
      "Deterministic fallback = works offline",
      "No specialized hardware — runs on field laptops"]),
]

for i, (title, color, lines) in enumerate(biz2):
    x = 210 + i * 310
    y = H - 320
    card(c, x, y, 280, 170, color)
    text(c, x + 20, y - 30, title, size=15, bold=True, color=color)
    for j, line in enumerate(lines):
        text(c, x + 20, y - 60 - j * 22, line, size=11, color=LIGHT)

slide_num(c, 10)
c.showPage()

# ── SLIDE 11: Revenue Model ──────────────────────────
bg(c)
accent_bar_top(c)

text(c, 55, H - 50, "REVENUE MODEL", size=12, color=ACCENT, bold=True)
text(c, 55, H - 85, "SaaS Tiers & Future Roadmap", size=34, bold=True)

tiers = [
    ("Training", "Per-seat license", ACCENT, [
        "10 Gripen fleet simulation",
        "30-day campaign scenarios",
        "Aircraft lifecycle management",
        "Resource tracking dashboard",
    ]),
    ("Advanced", "Per-base subscription", CYAN, [
        "Everything in Training, plus:",
        "AI-powered recommendations",
        "Compare Mode (what-if)",
        "Decision audit trail & export",
    ]),
    ("Enterprise", "Enterprise agreement", GREEN, [
        "Everything in Advanced, plus:",
        "Custom scenario editor",
        "Multi-base coordination",
        "Multiplayer roles (AOC/BC/KlT)",
    ]),
]

for i, (name, price, color, features) in enumerate(tiers):
    x = 55 + i * 310
    y = H - 130
    card(c, x, y, 280, 310, color)
    text(c, x + 20, y - 35, name, size=22, bold=True, color=color)
    # Price badge
    c.setFillColor(DARK_ROW)
    c.roundRect(x + 15, y - 80, 250, 28, 4, fill=1, stroke=0)
    text_center(c, x + 15, y - 73, 250, price, size=12, bold=True, color=color)
    for j, feat in enumerate(features):
        text(c, x + 25, y - 125 - j * 32, f"  {feat}", size=12, color=LIGHT)

# Roadmap bar
card(c, 40, 70, W - 80, 50)
text(c, 60, 55, "FUTURE ROADMAP", size=9, bold=True, color=ACCENT)
text_center(c, 40, 35, W - 80,
            "Mobile/tablet  |  VR/AR training  |  Real fleet data  |  NATO interop  |  Predictive maintenance AI",
            size=11, color=MUTED)

slide_num(c, 11)
c.showPage()

# ── SLIDE 12: Closing ────────────────────────────────
bg(c)
accent_bar_top(c)

text_center(c, 0, H * 0.72, W,
            "We didn't just digitize a board game.", size=30, color=LIGHT)
text_center(c, 0, H * 0.62, W,
            "We built the foundation for Saab's", size=36, bold=True)
text_center(c, 0, H * 0.55, W,
            "next-generation air base command system.", size=36, bold=True)

pillars = [
    ("Proven Training", "Methodology", "Faithful digitization of", "Saab's board game", ACCENT),
    ("AI-Augmented", "Decision Support", "Explainable AI that", "builds trust & skill", CYAN),
    ("Production-Ready", "Architecture", "Edge-deployable, offline,", "scalable to enterprise", GREEN),
]

for i, (t1, t2, d1, d2, color) in enumerate(pillars):
    x = 100 + i * 290
    y = H * 0.38
    card(c, x, y, 250, 120, color)
    text_center(c, x, y - 30, 250, t1, size=14, bold=True, color=color)
    text_center(c, x, y - 50, 250, t2, size=14, bold=True, color=color)
    text_center(c, x, y - 80, 250, d1, size=11, color=LIGHT)
    text_center(c, x, y - 98, 250, d2, size=11, color=LIGHT)

text_center(c, 0, 80, W, "AIRBASE OPS", size=26, bold=True, color=ACCENT)
text_center(c, 0, 50, W,
            "Saab Smart Air Base Hackathon  |  March 2026", size=13, color=MUTED)

slide_num(c, 12)
c.showPage()

# ── Save ─────────────────────────────────────────────
c.save()
print(f"PDF saved to: {OUTPUT}")
