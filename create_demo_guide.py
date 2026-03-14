#!/usr/bin/env python3
"""Generate a detailed 5-minute demo navigation guide PDF for AirBase Ops pitch."""

from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

# ── Page Setup (landscape widescreen) ────────────────
W, H = 13.333 * inch, 7.5 * inch
OUTPUT = "/Users/omarali/Web/SaabHackathon/AirBaseOps_DemoGuide.pdf"

# ── Colors ───────────────────────────────────────────
BG       = HexColor("#0F172A")
BG_CARD  = HexColor("#16203A")
BG_DARK  = HexColor("#1E293B")
ACCENT   = HexColor("#3B82F6")
CYAN     = HexColor("#22D3EE")
GREEN    = HexColor("#22C55E")
ORANGE   = HexColor("#F97316")
RED      = HexColor("#EF4444")
YELLOW   = HexColor("#FACC15")
PURPLE   = HexColor("#A855F7")
WHITE    = HexColor("#FFFFFF")
LIGHT    = HexColor("#CBD5E1")
MUTED    = HexColor("#94A3B8")
DIM      = HexColor("#64748B")

TOTAL = 18


# ── Helpers ──────────────────────────────────────────
def page_bg(c):
    c.setFillColor(BG)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(ACCENT)
    c.rect(0, H - 4, W, 4, fill=1, stroke=0)

def sn(c, n):
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9)
    c.drawRightString(W - 40, 25, f"{n}/{TOTAL}")

def txt(c, x, y, t, sz=14, color=WHITE, bold=False, mono=False):
    f = "Courier-Bold" if mono and bold else "Courier" if mono else "Helvetica-Bold" if bold else "Helvetica"
    c.setFillColor(color)
    c.setFont(f, sz)
    c.drawString(x, y, t)

def txt_c(c, x, y, w, t, sz=14, color=WHITE, bold=False):
    f = "Helvetica-Bold" if bold else "Helvetica"
    c.setFillColor(color)
    c.setFont(f, sz)
    tw = c.stringWidth(t, f, sz)
    c.drawString(x + (w - tw) / 2, y, t)

def card(c, x, y, w, h, accent=None, side="top"):
    c.setFillColor(BG_CARD)
    c.rect(x, y - h, w, h, fill=1, stroke=0)
    if accent:
        if side == "top":
            c.setFillColor(accent)
            c.rect(x, y, w, 4, fill=1, stroke=0)
        elif side == "left":
            c.setFillColor(accent)
            c.rect(x, y - h, 5, h, fill=1, stroke=0)

def badge(c, x, y, w, h, color, label, txt_color=None):
    if txt_color is None:
        txt_color = BG
    c.setFillColor(color)
    c.roundRect(x, y, w, h, 4, fill=1, stroke=0)
    f = "Helvetica-Bold"
    c.setFillColor(txt_color)
    c.setFont(f, h * 0.55)
    tw = c.stringWidth(label, f, h * 0.55)
    c.drawString(x + (w - tw) / 2, y + h * 0.25, label)

def time_badge(c, x, y, label, color=ACCENT):
    badge(c, x, y, 55, 20, color, label)

def click_indicator(c, x, y, label="CLICK"):
    c.setFillColor(YELLOW)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x, y, f">> {label}")

def say_badge(c, x, y, text):
    c.setFillColor(HexColor("#1a2744"))
    c.roundRect(x, y - 2, len(text) * 6.2 + 16, 18, 3, fill=1, stroke=0)
    c.setFillColor(CYAN)
    c.setFont("Helvetica", 9)
    c.drawString(x + 8, y + 2, text)

def arrow_right(c, x, y, length=30, color=CYAN):
    c.setStrokeColor(color)
    c.setLineWidth(2)
    c.line(x, y, x + length, y)
    c.line(x + length - 6, y + 4, x + length, y)
    c.line(x + length - 6, y - 4, x + length, y)

def section_header(c, y, number, title, time_label, color):
    """Draw a phase/section header bar."""
    c.setFillColor(color)
    c.setLineWidth(0)
    c.roundRect(50, y - 2, 36, 28, 5, fill=1, stroke=0)
    c.setFillColor(BG)
    c.setFont("Helvetica-Bold", 18)
    tw = c.stringWidth(number, "Helvetica-Bold", 18)
    c.drawString(50 + (36 - tw) / 2, y + 5, number)
    txt(c, 96, y + 5, title, sz=20, bold=True, color=color)
    badge(c, W - 160, y + 2, 110, 22, BG_DARK, time_label, color)

def step_row(c, x, y, action, detail, click_label=None, speak=None):
    """Draw a single step row with action, detail, optional click and speak cues."""
    txt(c, x, y, action, sz=13, bold=True)
    txt(c, x, y - 18, detail, sz=11, color=MUTED)
    if click_label:
        click_indicator(c, x + 520, y, click_label)
    if speak:
        say_badge(c, x + 520, y - 18, speak)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
c = canvas.Canvas(OUTPUT, pagesize=(W, H))
c.setTitle("AirBase Ops — Demo Navigation Guide")
c.setAuthor("AirBase Ops Team")


# ── PAGE 1: Title ────────────────────────────────────
page_bg(c)

txt_c(c, 0, H * 0.72, W, "AIRBASE OPS", sz=52, bold=True)
txt_c(c, 0, H * 0.62, W, "5-Minute Demo Navigation Guide", sz=28, color=CYAN)
txt_c(c, 0, H * 0.54, W, "Step-by-step presenter script for the live prototype walkthrough", sz=16, color=LIGHT)

# Timeline overview
card(c, 80, H * 0.42, W - 160, 120)

phases = [
    ("0:00-0:30", "Slides 1-3", "Problem & Users", ACCENT, 0),
    ("0:30-1:00", "Slide 4", "Solution Overview", CYAN, 1),
    ("1:00-1:30", "LIVE APP", "Start & Fleet View", GREEN, 2),
    ("1:30-2:30", "LIVE APP", "Assign & AI Recs", YELLOW, 3),
    ("2:30-3:30", "LIVE APP", "Map & Compare", ORANGE, 4),
    ("3:30-4:15", "LIVE APP", "Advance & Events", RED, 5),
    ("4:15-4:45", "LIVE APP", "AI Chat & KPIs", PURPLE, 6),
    ("4:45-5:00", "Slide 12", "Close & CTA", ACCENT, 7),
]

for i, (time, source, label, color, _) in enumerate(phases):
    x = 100 + i * 115
    y_base = H * 0.42 - 105
    c.setFillColor(color)
    c.roundRect(x, y_base + 60, 100, 35, 4, fill=1, stroke=0)
    c.setFillColor(BG)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 5, y_base + 80, time)
    c.setFont("Helvetica", 7)
    c.drawString(x + 5, y_base + 67, source)
    c.setFillColor(color)
    c.setFont("Helvetica", 9)
    c.drawString(x + 5, y_base + 45, label)

# Legend
card(c, 80, H * 0.17, W - 160, 55)
y_leg = H * 0.17 - 38
txt(c, 100, y_leg + 15, "LEGEND:", sz=10, bold=True, color=MUTED)
badge(c, 185, y_leg + 10, 60, 18, YELLOW, "CLICK", BG)
txt(c, 255, y_leg + 14, "= Button/element to click", sz=9, color=MUTED)
say_badge(c, 430, y_leg + 12, "SAY THIS = Presenter speaking cue")
badge(c, 700, y_leg + 10, 65, 18, GREEN, "SHOW", BG)
txt(c, 775, y_leg + 14, "= Point at screen element", sz=9, color=MUTED)

sn(c, 1)
c.showPage()


# ── PAGE 2: Phase 0 — Slides Before Demo ─────────────
page_bg(c)
txt(c, 55, H - 50, "PHASE 0: PRESENTATION SLIDES", sz=12, color=ACCENT, bold=True)
txt(c, 55, H - 85, "PowerPoint Slides Before Switching to Live App", sz=32, bold=True)
txt(c, 55, H - 115, "Show slides 1-4 from the pitch deck. These set up context for the live demo.", sz=15, color=LIGHT)

# Slide cards
slides_info = [
    ("Slide 1", "Title Slide", "0:00-0:10", ACCENT,
     "Show title, team name. Say: 'We built AirBase Ops — an AI-powered digital twin of Saab's",
     "logistics board game for dispersed air base training.'"),
    ("Slide 2", "The Problem", "0:10-0:20", RED,
     "Point at 6 pain points. Say: 'Today, base commanders train with paper cards and dice.",
     "Sessions need 8+ people, take all day, and generate zero data.'"),
    ("Slide 3", "The Users", "0:20-0:30", GREEN,
     "Point at 3 user cards. Say: 'Our users are the Basbatchef, maintenance planners, and prep crews.",
     "They all share one goal: maximize sortie generation across a 30-day campaign.'"),
    ("Slide 4", "Our Solution", "0:30-1:00", CYAN,
     "Point at architecture. Say: 'We digitized every board game mechanic, then added three things",
     "the physical game can never have: AI recommendations, what-if simulation, and real-time KPIs.'"),
]

for i, (slide, title, time, color, line1, line2) in enumerate(slides_info):
    y = H - 175 - i * 100
    card(c, 55, y + 30, W - 110, 90, color)
    badge(c, 70, y + 5, 70, 22, color, slide, BG)
    txt(c, 150, y + 8, title, sz=16, bold=True, color=color)
    badge(c, W - 175, y + 5, 100, 22, BG_DARK, time, color)
    txt(c, 70, y - 25, line1, sz=11, color=LIGHT)
    txt(c, 70, y - 42, line2, sz=11, color=LIGHT)

# Transition callout
card(c, 55, 90, W - 110, 55, YELLOW)
txt(c, 75, 60, "TRANSITION TO LIVE APP:", sz=14, bold=True, color=YELLOW)
txt(c, 75, 40, "Say: \"Now let me show you the actual prototype. This is a fully working application — everything you see is real.\"",
    sz=12, color=LIGHT)
txt(c, 75, 22, "Switch from PowerPoint to the browser (have app pre-loaded at localhost:5173, game NOT started yet).",
    sz=11, color=MUTED)

sn(c, 2)
c.showPage()


# ── PAGE 3: Phase 1 — App Launch & First Impression ──
page_bg(c)
section_header(c, H - 55, "1", "APP LAUNCH & FIRST IMPRESSION", "1:00 - 1:30", GREEN)
txt(c, 55, H - 95, "Goal: Show the start screen, launch the game, and orient the audience to the dashboard layout.", sz=14, color=LIGHT)

steps = [
    ("STEP 1: Show the Start Screen", GREEN,
     [("The browser shows the animated splash screen with particle background.", None, None),
      ("A large 'START COMMAND CENTER' button is centered on screen.", None, "SAY: 'This is a one-click launch — no setup, no 8 people required.'"),
      ]),
    ("STEP 2: Click 'START COMMAND CENTER'", YELLOW,
     [("Click the large shimmer button in the center of the splash screen.", "CLICK: START COMMAND CENTER", None),
      ("The onboarding tutorial modal appears with 6 steps.", None, None),
      ("Click 'Skip tutorial' link at the bottom to go straight to the dashboard.", "CLICK: Skip tutorial", None),
      ]),
    ("STEP 3: Orient the Dashboard", CYAN,
     [("The 3-column dashboard fades in. Pause 2-3 seconds to let the audience absorb it.", None, None),
      ("Point LEFT: 'Air Tasking Order panel — today's missions from command.'", None, "SAY: 'Left panel: missions. Center: operations. Right: resources.'"),
      ("Point CENTER: 'Fleet Operations Board — all 10 Gripen aircraft at a glance.'", None, None),
      ("Point RIGHT: 'Resources Panel — fuel, weapons, parts, crews.'", None, None),
      ]),
    ("STEP 4: Show the KPI Strip", ACCENT,
     [("Point at the 4 metrics below the top bar.", None, "SAY: 'These 4 KPIs update in real-time with every decision.'"),
      ("Hover over Fleet Readiness to show tooltip.", "HOVER: Fleet Readiness", None),
      ("Point: 'Readiness is 100% — all aircraft start ready. Risk is low. Let's change that.'", None, None),
      ]),
]

y_pos = H - 135
for title, color, substeps in steps:
    card(c, 55, y_pos, W - 110, 30 + len(substeps) * 38, color, side="left")
    txt(c, 70, y_pos - 20, title, sz=14, bold=True, color=color)
    for j, (desc, click, speak) in enumerate(substeps):
        yy = y_pos - 48 - j * 38
        txt(c, 75, yy, desc, sz=11, color=LIGHT)
        if click:
            click_indicator(c, 680, yy, click)
        if speak:
            say_badge(c, 680, yy - 15, speak)
    y_pos -= 42 + len(substeps) * 38

sn(c, 3)
c.showPage()


# ── PAGE 4: Phase 1 continued — Dashboard Layout ─────
page_bg(c)
section_header(c, H - 55, "1", "DASHBOARD LAYOUT REFERENCE", "1:00 - 1:30", GREEN)
txt(c, 55, H - 95, "Visual reference: What the audience sees after game starts. Point at each area as you speak.", sz=14, color=LIGHT)

# Draw the layout diagram
layout_y = H - 140
layout_h = 350

# TopBar
c.setFillColor(BG_DARK)
c.rect(80, layout_y - 35, W - 160, 35, fill=1, stroke=0)
c.setFillColor(ACCENT)
c.rect(80, layout_y, W - 160, 3, fill=1, stroke=0)
txt(c, 90, layout_y - 25, "TOP BAR", sz=10, bold=True, color=ACCENT)
txt(c, 200, layout_y - 25, "AIRBASE OPS   DAY 1/30   PEACE   00:00   Turn 1/720", sz=9, color=MUTED, mono=True)
txt(c, 680, layout_y - 25, "[1H] [1D] [Compare] [AI] [?] [Reset]", sz=9, color=YELLOW, mono=True)

# KPI Strip
c.setFillColor(HexColor("#0d1525"))
c.rect(80, layout_y - 65, W - 160, 28, fill=1, stroke=0)
txt(c, 90, layout_y - 57, "KPI STRIP", sz=9, bold=True, color=GREEN)
kpi_labels = [
    ("Fleet Readiness 100%", GREEN),
    ("Throughput 5", ACCENT),
    ("Turnaround 0 min", ORANGE),
    ("Risk Score 12", RED),
]
kx = 240
for label, color in kpi_labels:
    badge(c, kx, layout_y - 62, 150, 20, BG_DARK, label, color)
    kx += 170

# Left Panel
lp_top = layout_y - 75
lp_h = layout_h - 80
c.setFillColor(BG_CARD)
c.rect(80, lp_top - lp_h, 200, lp_h, fill=1, stroke=0)
c.setFillColor(ACCENT)
c.rect(80, lp_top, 200, 3, fill=1, stroke=0)
txt(c, 90, lp_top - 20, "ATO PANEL (Left)", sz=10, bold=True, color=ACCENT)
txt(c, 90, lp_top - 40, "AIR TASKING ORDER", sz=8, color=MUTED)
txt(c, 90, lp_top - 60, "[AI Suggest Allocation]", sz=8, color=CYAN, mono=True)
missions_labels = ["QRA-001  2ac  06:00", "DCA-001  2ac  08:00", "RECCE-001 2ac 10:00", "DCA-002  2ac  14:00"]
for i, m in enumerate(missions_labels):
    my = lp_top - 85 - i * 25
    c.setFillColor(BG_DARK)
    c.rect(90, my - 5, 180, 20, fill=1, stroke=0)
    txt(c, 95, my, m, sz=8, color=LIGHT, mono=True)
txt(c, 90, lp_top - 200, "Each mission shows:", sz=8, color=DIM)
txt(c, 90, lp_top - 215, "type, required ac, time,", sz=8, color=DIM)
txt(c, 90, lp_top - 230, "status, [+Assign] dropdown", sz=8, color=DIM)

# Center Panel
cp_left = 290
cp_w = W - 160 - 200 - 200 - 20
c.setFillColor(BG_CARD)
c.rect(cp_left, lp_top - lp_h, cp_w, lp_h, fill=1, stroke=0)
c.setFillColor(GREEN)
c.rect(cp_left, lp_top, cp_w, 3, fill=1, stroke=0)
txt(c, cp_left + 10, lp_top - 20, "CENTER WORKSPACE", sz=10, bold=True, color=GREEN)
txt(c, cp_left + 10, lp_top - 42, "Toggle: [Fleet Board] / [Tactical Map]", sz=9, color=MUTED)

# Draw mini aircraft grid
for row in range(2):
    for col in range(5):
        ax = cp_left + 20 + col * 95
        ay = lp_top - 75 - row * 70
        c.setFillColor(BG_DARK)
        c.roundRect(ax, ay, 85, 60, 3, fill=1, stroke=0)
        txt(c, ax + 5, ay + 42, f"GE-{row*5+col+1:02d}", sz=8, bold=True, mono=True)
        colors = [GREEN, GREEN, GREEN, YELLOW, GREEN, GREEN, ACCENT, GREEN, RED, GREEN]
        status = ["READY", "READY", "READY", "PREP", "READY", "READY", "FLYING", "READY", "MAINT", "READY"]
        badge(c, ax + 5, ay + 20, 50, 14, colors[row*5+col], status[row*5+col], BG)
        txt(c, ax + 5, ay + 5, "Fuel: 100%", sz=6, color=MUTED)

# Timeline bar at bottom of center
c.setFillColor(HexColor("#0d1525"))
c.rect(cp_left, lp_top - lp_h, cp_w, 25, fill=1, stroke=0)
txt(c, cp_left + 5, lp_top - lp_h + 8, "TIMELINE: 00  02  04  06  08  10  12  14  16  18  20  22", sz=7, color=DIM, mono=True)
# Current hour marker
c.setFillColor(RED)
c.rect(cp_left + 20, lp_top - lp_h, 2, 25, fill=1, stroke=0)

# Right Panel
rp_left = cp_left + cp_w + 10
c.setFillColor(BG_CARD)
c.rect(rp_left, lp_top - lp_h, 200, lp_h, fill=1, stroke=0)
c.setFillColor(ORANGE)
c.rect(rp_left, lp_top, 200, 3, fill=1, stroke=0)
txt(c, rp_left + 10, lp_top - 20, "RESOURCES (Right)", sz=10, bold=True, color=ORANGE)

res_items = [
    ("Fuel", "180,000L", CYAN),
    ("Missiles", "180", ORANGE),
    ("Bombs", "120", ORANGE),
    ("Pods", "10", CYAN),
    ("Spare Parts", "60", LIGHT),
    ("Exchange Units", "16", CYAN),
    ("Crews On Duty", "3/6", GREEN),
]
for i, (name, val, color) in enumerate(res_items):
    ry = lp_top - 45 - i * 30
    txt(c, rp_left + 15, ry, name, sz=9, color=LIGHT)
    txt(c, rp_left + 140, ry, val, sz=9, bold=True, color=color)

# Annotations
annotation_y = lp_top - lp_h - 30
txt(c, 80, annotation_y, "PRESENTER TIP:", sz=11, bold=True, color=YELLOW)
txt(c, 210, annotation_y, "Sweep your hand left-to-right across the screen: 'Missions... Operations... Resources. Everything a commander needs, one screen.'",
    sz=11, color=LIGHT)

sn(c, 4)
c.showPage()


# ── PAGE 5: Phase 2 — AI Recommendations ─────────────
page_bg(c)
section_header(c, H - 55, "2", "AI-POWERED MISSION ALLOCATION", "1:30 - 2:30", YELLOW)
txt(c, 55, H - 95, "Goal: Show the AI Suggest button, recommendation cards, and one-click Apply All.", sz=14, color=LIGHT)

y = H - 140

steps2 = [
    ("STEP 1: Point at ATO Panel", "Left panel shows 4 pending missions for Day 1. All show gray 'PENDING' badges.",
     None, "SAY: 'Command has given us 4 missions today. We need to decide which aircraft fly which mission.'"),
    ("STEP 2: Click 'AI Suggest Allocation'", "The cyan shimmer button at the top of the ATO panel. Text changes to 'Analyzing Fleet...'",
     "CLICK: AI Suggest Allocation", "SAY: 'Instead of manual allocation, let's ask the AI advisor.'"),
    ("STEP 3: AI Recommendation Cards Modal Opens", "A centered modal appears with numbered recommendation cards. Each card has:",
     None, None),
]

for title, desc, click, speak in steps2:
    card(c, 55, y, W - 110, 70 if speak else 55, YELLOW, "left")
    txt(c, 70, y - 18, title, sz=13, bold=True, color=YELLOW)
    txt(c, 70, y - 38, desc, sz=11, color=LIGHT)
    if click:
        click_indicator(c, 700, y - 18, click)
    if speak:
        say_badge(c, 700, y - 38, speak)
    y -= 80 if speak else 65

# Detailed rec card anatomy
card(c, 55, y, W - 110, 200, CYAN)
txt(c, 70, y - 18, "RECOMMENDATION CARD ANATOMY — Point at each element:", sz=13, bold=True, color=CYAN)

# Draw a sample recommendation card
sample_x = 80
sample_y = y - 45

c.setFillColor(BG_DARK)
c.roundRect(sample_x, sample_y - 130, 400, 130, 6, fill=1, stroke=0)
c.setFillColor(CYAN)
c.rect(sample_x, sample_y, 400, 3, fill=1, stroke=0)

txt(c, sample_x + 10, sample_y - 20, "#1  Assign GE-01 and GE-03 to QRA-001", sz=12, bold=True, color=WHITE)

badge(c, sample_x + 310, sample_y - 25, 80, 18, GREEN, "85% conf", BG)

txt(c, sample_x + 10, sample_y - 45, "WHY:", sz=9, bold=True, color=CYAN)
txt(c, sample_x + 45, sample_y - 45, "GE-01 has highest fuel at 100%. QRA launches in 6h — good prep window.", sz=9, color=LIGHT)

txt(c, sample_x + 10, sample_y - 65, "EFFECTS:", sz=9, bold=True, color=CYAN)
badge(c, sample_x + 70, sample_y - 70, 90, 16, HexColor("#0a3320"), "Readiness +12%", GREEN)
badge(c, sample_x + 170, sample_y - 70, 85, 16, HexColor("#0a2040"), "Throughput +2", ACCENT)
badge(c, sample_x + 265, sample_y - 70, 70, 16, HexColor("#3b1818"), "Risk -8", RED)

txt(c, sample_x + 10, sample_y - 95, "ASSUMES:", sz=9, bold=True, color=MUTED)
txt(c, sample_x + 70, sample_y - 95, "No faults during pre-flight prep", sz=9, color=DIM)
txt(c, sample_x + 10, sample_y - 115, "TRADEOFF:", sz=9, bold=True, color=ORANGE)
txt(c, sample_x + 80, sample_y - 115, "Leaves 2 aircraft as reserve for unexpected tasking", sz=9, color=DIM)

# Annotations pointing to elements
annot_x = 510
txt(c, annot_x, sample_y - 15, "Action title — specific aircraft + mission IDs", sz=10, color=YELLOW)
arrow_right(c, annot_x - 25, sample_y - 13, -20, YELLOW)
txt(c, annot_x, sample_y - 35, "Confidence score — green >= 75%, amber 50-75%, red < 50%", sz=10, color=YELLOW)
txt(c, annot_x, sample_y - 55, "Bullet-point reasoning — WHY this allocation", sz=10, color=YELLOW)
txt(c, annot_x, sample_y - 75, "Expected KPI effects — color-coded deltas", sz=10, color=YELLOW)
txt(c, annot_x, sample_y - 95, "Assumptions & tradeoffs — builds trust in AI", sz=10, color=YELLOW)

y -= 210

# Apply step
card(c, 55, y, W - 110, 65, GREEN, "left")
txt(c, 70, y - 18, "STEP 4: Click 'Apply All Assignments'", sz=13, bold=True, color=GREEN)
txt(c, 70, y - 38, "Cyan button at bottom of modal. All recommended aircraft get assigned instantly. Modal closes.", sz=11, color=LIGHT)
click_indicator(c, 700, y - 18, "CLICK: Apply All Assignments")
say_badge(c, 700, y - 38, "SAY: 'One click — all missions allocated. No spreadsheets.'")

sn(c, 5)
c.showPage()


# ── PAGE 6: Phase 2 continued — Manual Assignment ────
page_bg(c)
section_header(c, H - 55, "2", "MANUAL ASSIGNMENT & AIRCRAFT DETAILS", "1:30 - 2:30", YELLOW)
txt(c, 55, H - 95, "Goal: Show the manual assignment flow and aircraft detail card to demonstrate depth.", sz=14, color=LIGHT)

y = H - 140

steps3 = [
    ("STEP 5: Show Updated ATO Panel", ACCENT,
     [("After Apply All, missions now show assigned aircraft as colored chips.", None,
       "SAY: 'Notice the missions now show which aircraft are assigned.'"),
      ("Status badges changed from 'PENDING' (gray) to 'ASSIGNED' (amber).", None, None),
      ]),
    ("STEP 6: Demonstrate Manual Unassign", RED,
     [("Click the X on one aircraft chip to unassign it from a mission.", "CLICK: X on aircraft chip", None),
      ("Aircraft chip disappears, mission goes back to needing more aircraft.", None,
       "SAY: 'You can always override the AI — full manual control.'"),
      ]),
    ("STEP 7: Demonstrate Manual Assign", GREEN,
     [("Click '+Assign' dropdown on that same mission.", "CLICK: +Assign dropdown", None),
      ("Dropdown shows available aircraft with status dots: green = Ready, red = Maint.", None, None),
      ("Click an aircraft to assign it.", "CLICK: Aircraft in dropdown", "SAY: 'Manual or AI — your choice. The AI suggests, you decide.'"),
      ]),
    ("STEP 8: Open Aircraft Detail Card", CYAN,
     [("Click any aircraft card in the Fleet Board (center workspace).", "CLICK: Aircraft card GE-01",
       "SAY: 'Let me show you the depth of simulation here.'"),
      ("Modal shows: Status, Fuel bar, Service hours, Weapon loadout, Mission link.", None, None),
      ("Point at 'Service Hours Remaining' — 'This aircraft needs maintenance in 10 flight hours.'", None, None),
      ("Point at weapon counts — 'Armed with 2 missiles, ready for DCA.'", None, None),
      ("Close the modal.", "CLICK: X to close", None),
      ]),
]

for title, color, substeps in steps3:
    h = 28 + len(substeps) * 40
    card(c, 55, y, W - 110, h, color, "left")
    txt(c, 70, y - 18, title, sz=13, bold=True, color=color)
    for j, (desc, click, speak) in enumerate(substeps):
        yy = y - 48 - j * 40
        txt(c, 75, yy, desc, sz=11, color=LIGHT)
        if click:
            click_indicator(c, 700, yy, click)
        if speak:
            say_badge(c, 700, yy - 16, speak)
    y -= h + 12

sn(c, 6)
c.showPage()


# ── PAGE 7: Phase 3 — Tactical Map ──────────────────
page_bg(c)
section_header(c, H - 55, "3", "TACTICAL MAP & GEOSPATIAL VIEW", "2:30 - 3:00", ORANGE)
txt(c, 55, H - 95, "Goal: Switch to the tactical map to show geospatial awareness — a capability the board game cannot provide.", sz=14, color=LIGHT)

y = H - 140

map_steps = [
    ("STEP 9: Switch to Tactical Map View", GREEN,
     [("In the center workspace header, there's a toggle between Fleet Board and Map.", "CLICK: Map toggle",
       "SAY: 'Now let me show you something the physical board game can never do.'"),
      ]),
    ("STEP 10: Orient the Map", ACCENT,
     [("The map shows F 17 Kallinge base (blue glowing dot) in southern Sweden.", None,
       "SAY: 'This is our base. The map shows mission zones and aircraft positions in real-time.'"),
      ("Colored circles represent mission zones: red = QRA, blue = DCA, green = RECCE.", None, None),
      ("Lines connect the base to each mission area (polyline routes).", None, None),
      ]),
    ("STEP 11: Click a Mission Zone", ORANGE,
     [("Click on one of the colored circles on the map (e.g., the RECCE zone).", "CLICK: RECCE mission circle", None),
      ("Right-side info panel shows: Mission ID, Area name, Distance, Assigned aircraft.", None,
       "SAY: 'Click any zone — time on target, distance, aircraft package, all at a glance.'"),
      ]),
    ("STEP 12: Click an Aircraft Marker", CYAN,
     [("If any aircraft are flying, click a plane icon on the map.", "CLICK: Aircraft marker", None),
      ("Right panel shows: Status, Fuel level, Mission phase (outbound/returning), ETA.", None,
       "SAY: 'Track every aircraft in real-time. Outbound, on target, or returning.'"),
      ("Point at 'Open Detailed Aircraft Card' button if shown.", None, None),
      ]),
]

for title, color, substeps in map_steps:
    h = 25 + len(substeps) * 38
    card(c, 55, y, W - 110, h, color, "left")
    txt(c, 70, y - 18, title, sz=13, bold=True, color=color)
    for j, (desc, click, speak) in enumerate(substeps):
        yy = y - 46 - j * 38
        txt(c, 75, yy, desc, sz=11, color=LIGHT)
        if click:
            click_indicator(c, 700, yy, click)
        if speak:
            say_badge(c, 700, yy - 15, speak)
    y -= h + 12

sn(c, 7)
c.showPage()


# ── PAGE 8: Phase 3 continued — Compare Mode ─────────
page_bg(c)
section_header(c, H - 55, "3", "COMPARE MODE — WHAT-IF ANALYSIS", "3:00 - 3:30", ORANGE)
txt(c, 55, H - 95, "Goal: Show the non-destructive simulation comparing baseline vs AI-optimized plans.", sz=14, color=LIGHT)

y = H - 140

compare_steps = [
    ("STEP 13: Click 'Compare' Button in TopBar", PURPLE,
     [("The GitCompareArrows icon button labeled 'Compare' is in the top-right action buttons.", "CLICK: Compare button",
       "SAY: 'What if we could see the future before committing? That's Compare Mode.'"),
      ]),
    ("STEP 14: Click 'Run Comparison'", ACCENT,
     [("The Compare modal shows an explanation. Click the shimmer 'Run Comparison' button.", "CLICK: Run Comparison", None),
      ("Loading spinner appears: 'Simulating 6h forecast...'", None,
       "SAY: 'This runs a full 6-hour forward simulation without touching your actual game.'"),
      ]),
    ("STEP 15: Show the Comparison Table", GREEN,
     [("Table appears with 3 columns: METRIC | BASELINE | AI-OPTIMIZED | DELTA", None, None),
      ("Point at green deltas — 'AI completes more missions with lower risk.'", None,
       "SAY: 'Your plan vs the AI plan, side by side. No guessing, pure data.'"),
      ("Point at the summary badge at bottom — 'AI improves by X missions, Y risk reduction.'", None, None),
      ]),
]

for title, color, substeps in compare_steps:
    h = 25 + len(substeps) * 40
    card(c, 55, y, W - 110, h, color, "left")
    txt(c, 70, y - 18, title, sz=13, bold=True, color=color)
    for j, (desc, click, speak) in enumerate(substeps):
        yy = y - 46 - j * 40
        txt(c, 75, yy, desc, sz=11, color=LIGHT)
        if click:
            click_indicator(c, 700, yy, click)
        if speak:
            say_badge(c, 700, yy - 15, speak)
    y -= h + 15

# Compare table mockup
card(c, 55, y, W - 110, 175, PURPLE)
txt(c, 75, y - 18, "COMPARE MODE TABLE — What the audience sees:", sz=12, bold=True, color=PURPLE)

# Table
cols = [("METRIC", 80, MUTED), ("BASELINE", 300, RED), ("AI-OPTIMIZED", 500, GREEN), ("DELTA", 720, CYAN)]
ty = y - 45
for label, cx, color in cols:
    txt(c, cx, ty, label, sz=10, bold=True, color=color)

rows = [
    ("Missions Completed", "3", "5", "+2", GREEN),
    ("Missions Failed", "1", "0", "-1", GREEN),
    ("Avg Readiness", "62%", "78%", "+16%", GREEN),
    ("Fuel Burned", "4,200L", "3,800L", "-400L", GREEN),
    ("Final Risk Score", "45", "28", "-17", GREEN),
]
for i, (metric, base, ai, delta, dcolor) in enumerate(rows):
    ry = ty - 22 - i * 22
    if i % 2 == 0:
        c.setFillColor(BG_DARK)
        c.rect(75, ry - 5, 700, 20, fill=1, stroke=0)
    txt(c, 80, ry, metric, sz=10, color=LIGHT)
    txt(c, 300, ry, base, sz=10, color=RED)
    txt(c, 500, ry, ai, sz=10, color=GREEN)
    txt(c, 720, ry, delta, sz=10, bold=True, color=dcolor)

say_badge(c, 80, y - 165, "SAY: 'Non-destructive. The AI proved its value — same fuel, more missions, lower risk. The board game can't do this.'")

sn(c, 8)
c.showPage()


# ── PAGE 9: Phase 4 — Advance Time & Events ──────────
page_bg(c)
section_header(c, H - 55, "4", "ADVANCE TIME & DYNAMIC EVENTS", "3:30 - 4:15", RED)
txt(c, 55, H - 95, "Goal: Show the game loop in action — time advancing, missions launching, events triggering, resources depleting.", sz=14, color=LIGHT)

y = H - 140

time_steps = [
    ("STEP 16: Close Compare Modal & Advance Time", ACCENT,
     [("Close the Compare modal (X button).", "CLICK: X to close Compare", None),
      ("Click the '1H' button to advance 1 hour.", "CLICK: 1H button",
       "SAY: 'Let's advance time and watch the base come alive.'"),
      ("The KPI strip updates — readiness changes, turnaround shifts.", None, None),
      ]),
    ("STEP 17: Click '1D' to Fast-Forward", ORANGE,
     [("Click the '1D' button (FastForward icon) to advance 24 turns at once.", "CLICK: 1D button",
       "SAY: 'We can fast-forward entire days. Watch the campaign unfold.'"),
      ("Multiple event log entries appear in rapid succession.", None, None),
      ("Resources deplete visibly — fuel bar drops, missile count decreases.", None, None),
      ]),
    ("STEP 18: Show the Event Log", GREEN,
     [("Click the Event Log toggle button (bottom-right of screen).", "CLICK: Event Log button", None),
      ("Log shows chronological events: missions launched, aircraft returned, faults found.", None,
       "SAY: 'Every event is logged. Missions, faults, maintenance, crew shifts — complete audit trail.'"),
      ("Point at color-coded severity: blue = info, yellow = warning, red = critical, green = success.", None, None),
      ]),
    ("STEP 19: Show Resource Depletion", ORANGE,
     [("Click to expand the Resources panel on the right (if collapsed).", "CLICK: Resources header", None),
      ("Point at fuel bar — it's dropped from 180,000L.", None,
       "SAY: 'Resources are finite. Fuel is dropping. Missiles consumed. This creates real strategic tension.'"),
      ("Point at Exchange Units count — some may be 'in MRO repair'.", None, None),
      ]),
]

for title, color, substeps in time_steps:
    h = 25 + len(substeps) * 38
    card(c, 55, y, W - 110, h, color, "left")
    txt(c, 70, y - 18, title, sz=13, bold=True, color=color)
    for j, (desc, click, speak) in enumerate(substeps):
        yy = y - 46 - j * 38
        txt(c, 75, yy, desc, sz=11, color=LIGHT)
        if click:
            click_indicator(c, 700, yy, click)
        if speak:
            say_badge(c, 700, yy - 15, speak)
    y -= h + 10

sn(c, 9)
c.showPage()


# ── PAGE 10: Phase 4 continued — Day 4 Attack ────────
page_bg(c)
section_header(c, H - 55, "4", "DAY 4 CRUISE MISSILE ATTACK EVENT", "3:30 - 4:15", RED)
txt(c, 55, H - 95, "Goal: If time permits, advance to Day 4 to trigger the dramatic attack event. Otherwise, describe it verbally.", sz=14, color=LIGHT)

y = H - 140

card(c, 55, y, W - 110, 120, RED)
txt(c, 75, y - 18, "OPTION A: Advance to Day 4 (if time permits)", sz=14, bold=True, color=RED)
txt(c, 75, y - 45, "Click '1D' button 3 more times to reach Day 4. On Day 4, a cruise missile attack triggers automatically:", sz=12, color=LIGHT)
txt(c, 75, y - 68, "  1. Runway damaged — 8 hours of repair needed (no takeoffs)", sz=11, color=ORANGE)
txt(c, 75, y - 85, "  2. Two random aircraft take battle damage (composite repair needed)", sz=11, color=ORANGE)
txt(c, 75, y - 102, "  3. All aircraft in PRE_FLIGHT reset to HANGAR (prep work lost)", sz=11, color=ORANGE)

y -= 135

card(c, 55, y, W - 110, 75, YELLOW)
txt(c, 75, y - 18, "OPTION B: Describe verbally (if short on time)", sz=14, bold=True, color=YELLOW)
say_badge(c, 75, y - 45, "SAY: 'On Day 4, a cruise missile hits the base. Runway out for 8 hours. Two aircraft damaged.'")
say_badge(c, 75, y - 65, "SAY: 'All your prep work is lost. This is where real commanders are tested — and where our AI helps most.'")

y -= 95

card(c, 55, y, W - 110, 95, GREEN)
txt(c, 75, y - 18, "WHAT THE AUDIENCE SEES AFTER THE ATTACK:", sz=13, bold=True, color=GREEN)
txt(c, 75, y - 42, "KPI strip: Fleet Readiness drops sharply (red delta), Risk Score spikes (red delta)", sz=11, color=LIGHT)
txt(c, 75, y - 60, "Event Log: Critical red entries for 'CRUISE MISSILE ATTACK', 'RUNWAY DAMAGED', 'AIRCRAFT HIT'", sz=11, color=LIGHT)
txt(c, 75, y - 78, "Aircraft cards: 2 aircraft show red MAINTENANCE status with long repair times", sz=11, color=LIGHT)

y -= 110

card(c, 55, y, W - 110, 55, CYAN)
txt(c, 75, y - 18, "PRESENTER MOMENT:", sz=13, bold=True, color=CYAN)
say_badge(c, 75, y - 40, "SAY: 'This is the moment that defines a commander. The AI can help you recover — let me show you.'")

sn(c, 10)
c.showPage()


# ── PAGE 11: Phase 5 — AI Chat & KPIs ────────────────
page_bg(c)
section_header(c, H - 55, "5", "AI CHAT ADVISOR & KPI DEEP DIVE", "4:15 - 4:45", PURPLE)
txt(c, 55, H - 95, "Goal: Show the conversational AI and how the KPI strip provides constant feedback on every decision.", sz=14, color=LIGHT)

y = H - 140

chat_steps = [
    ("STEP 20: Open AI Chat", CYAN,
     [("Click the 'AI' button (MessageSquare icon) in the TopBar.", "CLICK: AI button",
       "SAY: 'Beyond structured recommendations, we have a conversational AI advisor.'"),
      ("The chat panel slides in from the right side.", None, None),
      ]),
    ("STEP 21: Use Quick Action — 'Assess readiness'", GREEN,
     [("Click the 'Assess readiness' quick action button at the top of the chat.", "CLICK: Assess readiness", None),
      ("AI responds with a detailed fleet status analysis — mentions specific aircraft.", None,
       "SAY: 'The AI knows every aircraft by ID, their status, fuel levels, mission assignments.'"),
      ]),
    ("STEP 22: Ask a Custom Question", ACCENT,
     [("Type in the chat input: 'Should we prioritize maintenance or launch more sorties?'", "TYPE: Custom question", None),
      ("AI responds with strategic advice considering current campaign phase and resources.", None,
       "SAY: 'Natural language, domain-aware. It understands flygbas terminology and campaign context.'"),
      ]),
    ("STEP 23: Show KPI Deltas", ORANGE,
     [("Close the AI chat (X button).", "CLICK: X to close chat", None),
      ("Point at the KPI strip — show the delta chips (green/red arrows).", None,
       "SAY: 'Every decision updates these 4 metrics instantly. The commander always knows the impact.'"),
      ("Hover over each metric to show the tooltip with formula explanation.", "HOVER: Each KPI metric", None),
      ]),
]

for title, color, substeps in chat_steps:
    h = 25 + len(substeps) * 40
    card(c, 55, y, W - 110, h, color, "left")
    txt(c, 70, y - 18, title, sz=13, bold=True, color=color)
    for j, (desc, click, speak) in enumerate(substeps):
        yy = y - 46 - j * 40
        txt(c, 75, yy, desc, sz=11, color=LIGHT)
        if click:
            click_indicator(c, 700, yy, click)
        if speak:
            say_badge(c, 700, yy - 15, speak)
    y -= h + 12

sn(c, 11)
c.showPage()


# ── PAGE 12: Phase 5 — AI Chat Layout Reference ──────
page_bg(c)
section_header(c, H - 55, "5", "AI CHAT PANEL — VISUAL REFERENCE", "4:15 - 4:45", PURPLE)
txt(c, 55, H - 95, "What the audience sees when the AI Chat panel is open.", sz=14, color=LIGHT)

# Draw the chat panel mockup
panel_x = W - 420
panel_y = H - 130
panel_w = 360
panel_h = 380

c.setFillColor(BG_CARD)
c.roundRect(panel_x, panel_y - panel_h, panel_w, panel_h, 8, fill=1, stroke=0)
c.setFillColor(CYAN)
c.rect(panel_x, panel_y, panel_w, 3, fill=1, stroke=0)

# Header
txt(c, panel_x + 15, panel_y - 25, "AI ADVISOR", sz=14, bold=True, color=CYAN, mono=True)
txt(c, panel_x + 15, panel_y - 42, "Operational Intelligence", sz=10, color=MUTED)

# Quick actions
qa_y = panel_y - 65
for i, label in enumerate(["Assess readiness", "Fuel forecast", "Maint priorities"]):
    bw = len(label) * 7 + 16
    badge(c, panel_x + 15 + i * (bw + 8), qa_y, bw, 20, BG_DARK, label, CYAN)

# Messages
msg_y = qa_y - 35

# AI message
c.setFillColor(BG_DARK)
c.roundRect(panel_x + 10, msg_y - 55, 280, 55, 4, fill=1, stroke=0)
c.setFillColor(CYAN)
c.rect(panel_x + 10, msg_y - 55, 3, 55, fill=1, stroke=0)
txt(c, panel_x + 20, msg_y - 10, "Fleet readiness is at 70%. GE-05 and", sz=9, color=LIGHT)
txt(c, panel_x + 20, msg_y - 24, "GE-09 are in maintenance. Recommend", sz=9, color=LIGHT)
txt(c, panel_x + 20, msg_y - 38, "prioritizing GE-05 (2h remaining).", sz=9, color=LIGHT)

# User message
msg_y -= 75
c.setFillColor(HexColor("#1e3a5f"))
c.roundRect(panel_x + 80, msg_y - 25, 270, 25, 4, fill=1, stroke=0)
txt(c, panel_x + 90, msg_y - 18, "Should we launch DCA-002 or wait?", sz=9, color=LIGHT)

# AI response
msg_y -= 50
c.setFillColor(BG_DARK)
c.roundRect(panel_x + 10, msg_y - 70, 280, 70, 4, fill=1, stroke=0)
c.setFillColor(CYAN)
c.rect(panel_x + 10, msg_y - 70, 3, 70, fill=1, stroke=0)
txt(c, panel_x + 20, msg_y - 10, "Given the crisis phase, I recommend", sz=9, color=LIGHT)
txt(c, panel_x + 20, msg_y - 24, "launching now. Fuel reserves support 3", sz=9, color=LIGHT)
txt(c, panel_x + 20, msg_y - 38, "more sorties today. Delaying increases", sz=9, color=LIGHT)
txt(c, panel_x + 20, msg_y - 52, "risk of missing the coverage window.", sz=9, color=LIGHT)

# Input
c.setFillColor(BG_DARK)
c.roundRect(panel_x + 10, panel_y - panel_h + 10, panel_w - 20, 30, 4, fill=1, stroke=0)
txt(c, panel_x + 20, panel_y - panel_h + 20, "Ask the AI advisor...", sz=10, color=DIM)

# Annotations on the left
annots = [
    (panel_y - 20, "Header with close button (X)", CYAN),
    (qa_y + 5, "Quick action buttons — one-click common questions", GREEN),
    (qa_y - 50, "AI messages — left-aligned, cyan left border", CYAN),
    (qa_y - 120, "User messages — right-aligned, blue background", ACCENT),
    (qa_y - 170, "AI responses reference specific aircraft IDs", CYAN),
    (panel_y - panel_h + 25, "Text input with send button", MUTED),
]

for ay, label, color in annots:
    txt(c, 55, ay, label, sz=11, color=color)
    c.setStrokeColor(color)
    c.setLineWidth(0.5)
    c.setDash([3, 3])
    c.line(55 + len(label) * 6.5, ay + 4, panel_x - 5, ay + 4)
    c.setDash([])

sn(c, 12)
c.showPage()


# ── PAGE 13: Phase 6 — Close with Slides ─────────────
page_bg(c)
section_header(c, H - 55, "6", "CLOSING — BACK TO SLIDES", "4:45 - 5:00", ACCENT)
txt(c, 55, H - 95, "Goal: Switch back to PowerPoint for the final 2 slides. Land the key message and business case.", sz=14, color=LIGHT)

y = H - 140

card(c, 55, y, W - 110, 65, YELLOW)
txt(c, 75, y - 18, "TRANSITION FROM APP TO SLIDES:", sz=13, bold=True, color=YELLOW)
say_badge(c, 75, y - 42, "SAY: 'That's the working prototype. Now let me tell you why this matters for Saab.'")
txt(c, 75, y - 58, "Alt-Tab back to PowerPoint. Go to Slide 9 (Before vs After comparison).", sz=11, color=MUTED)

y -= 90

slides_end = [
    ("Slide 9", "Board Game vs AirBase Ops", ACCENT,
     "Point at the comparison table. Let the audience read the contrast.",
     "SAY: 'From 8 people to 1. From hours of setup to seconds. From zero data to full audit trail.'"),
    ("Slide 10", "Business Case", GREEN,
     "Point at the 5 investment reasons.",
     "SAY: 'Training scalability, customer value amplifier, edge deployment. This is a product, not just a prototype.'"),
    ("Slide 12", "Closing Statement", CYAN,
     "Pause on the big statement.",
     "SAY: 'We didn't just digitize a board game. We built the foundation for Saab's next-generation command system.'"),
]

for slide, title, color, point, say in slides_end:
    card(c, 55, y, W - 110, 85, color)
    badge(c, 70, y - 22, 65, 22, color, slide, BG)
    txt(c, 145, y - 18, title, sz=15, bold=True, color=color)
    txt(c, 75, y - 48, point, sz=11, color=LIGHT)
    say_badge(c, 75, y - 68, say)
    y -= 100

# Final tip
card(c, 55, y, W - 110, 70, YELLOW)
txt(c, 75, y - 18, "FINAL 10 SECONDS — THE CLOSER:", sz=13, bold=True, color=YELLOW)
say_badge(c, 75, y - 42, "SAY: 'AirBase Ops. AI-powered. Edge-ready. Built for Saab. Thank you.'")
txt(c, 75, y - 62, "Pause. Make eye contact with judges. Wait for applause or questions.", sz=11, color=MUTED)

sn(c, 13)
c.showPage()


# ── PAGE 14: Timing Cheat Sheet ──────────────────────
page_bg(c)
txt(c, 55, H - 50, "TIMING CHEAT SHEET", sz=12, color=ACCENT, bold=True)
txt(c, 55, H - 85, "Complete 5-Minute Breakdown", sz=32, bold=True)
txt(c, 55, H - 115, "Keep this page visible on your phone or a second monitor. Glance at timestamps to stay on track.", sz=14, color=LIGHT)

# Table
col_defs = [
    ("TIME", 70, 90, MUTED),
    ("DURATION", 165, 50, MUTED),
    ("PHASE", 225, 250, MUTED),
    ("MEDIUM", 485, 80, MUTED),
    ("KEY ACTION", 575, 370, MUTED),
]

ty = H - 155
for label, x, w, color in col_defs:
    c.setFillColor(BG_DARK)
    c.rect(x, ty - 5, w, 25, fill=1, stroke=0)
    txt(c, x + 5, ty + 2, label, sz=10, bold=True, color=color)

rows = [
    ("0:00", "10s", "Title Slide", "PPT", "Team name, app name, one-line hook", ACCENT),
    ("0:10", "10s", "The Problem", "PPT", "6 pain points of physical board game", RED),
    ("0:20", "10s", "The Users", "PPT", "3 user roles, shared goal", GREEN),
    ("0:30", "30s", "Our Solution", "PPT", "Architecture, 4 value props — then transition to app", CYAN),
    ("1:00", "15s", "App Launch", "APP", "Click START COMMAND CENTER, skip tutorial", GREEN),
    ("1:15", "15s", "Dashboard Orient", "APP", "Sweep left-to-right: missions, fleet, resources, KPIs", GREEN),
    ("1:30", "30s", "AI Suggest", "APP", "Click AI Suggest, show rec cards, Apply All", YELLOW),
    ("2:00", "30s", "Manual + Details", "APP", "Unassign/reassign one aircraft, open detail card", YELLOW),
    ("2:30", "30s", "Tactical Map", "APP", "Switch to map, click zone, click aircraft marker", ORANGE),
    ("3:00", "30s", "Compare Mode", "APP", "Click Compare, Run Comparison, show table", ORANGE),
    ("3:30", "30s", "Advance Time", "APP", "Click 1H, then 1D, show event log, resource depletion", RED),
    ("4:00", "15s", "Day 4 Attack", "APP", "(Optional) Advance to Day 4 or describe verbally", RED),
    ("4:15", "15s", "AI Chat", "APP", "Open chat, click Assess readiness, type custom Q", PURPLE),
    ("4:30", "15s", "KPI Deep Dive", "APP", "Hover KPIs, show deltas and tooltips", PURPLE),
    ("4:45", "10s", "Comparison Slide", "PPT", "Board game vs AirBase Ops table", ACCENT),
    ("4:55", "5s", "Close", "PPT", "'We built the foundation for Saab's next-gen command system.'", CYAN),
]

for i, (time, dur, phase, medium, action, color) in enumerate(rows):
    ry = ty - 32 - i * 26
    if i % 2 == 0:
        c.setFillColor(BG_CARD)
        c.rect(65, ry - 5, 890, 24, fill=1, stroke=0)
    txt(c, 75, ry, time, sz=11, bold=True, color=color, mono=True)
    txt(c, 170, ry, dur, sz=10, color=MUTED)
    txt(c, 230, ry, phase, sz=11, color=color)

    # Medium badge
    med_color = ACCENT if medium == "PPT" else GREEN
    badge(c, 490, ry - 3, 40, 17, med_color, medium, BG)

    txt(c, 580, ry, action, sz=10, color=LIGHT)

sn(c, 14)
c.showPage()


# ── PAGE 15: Click Sequence Cheat Sheet ──────────────
page_bg(c)
txt(c, 55, H - 50, "CLICK SEQUENCE", sz=12, color=ACCENT, bold=True)
txt(c, 55, H - 85, "Every Click in Order — Numbered Reference", sz=32, bold=True)
txt(c, 55, H - 115, "The exact sequence of interactions during the live app demo (minutes 1:00-4:45).", sz=14, color=LIGHT)

clicks = [
    ("1", "START COMMAND CENTER", "Splash screen, center", "Launches the game", GREEN),
    ("2", "Skip tutorial", "Onboarding modal, bottom", "Dismisses tutorial overlay", MUTED),
    ("3", "AI Suggest Allocation", "ATO panel, top (cyan button)", "Opens AI recommendation cards", CYAN),
    ("4", "Apply All Assignments", "Rec cards modal, bottom", "Assigns all AI-recommended aircraft", GREEN),
    ("5", "X on aircraft chip", "ATO mission row", "Unassigns one aircraft (manual demo)", RED),
    ("6", "+Assign dropdown", "ATO mission row", "Opens available aircraft list", YELLOW),
    ("7", "Aircraft in dropdown", "Dropdown list", "Manually assigns aircraft", GREEN),
    ("8", "Aircraft card (GE-01)", "Fleet Board, center", "Opens aircraft detail modal", ACCENT),
    ("9", "X to close detail", "Detail modal, top-right", "Closes aircraft detail", MUTED),
    ("10", "Map toggle", "Center workspace header", "Switches to tactical map view", GREEN),
    ("11", "Mission circle (map)", "Map, colored circle", "Shows mission details in right panel", ORANGE),
    ("12", "Aircraft marker (map)", "Map, plane icon", "Shows aircraft status in right panel", CYAN),
    ("13", "Compare button", "TopBar, right section", "Opens Compare Mode modal", PURPLE),
    ("14", "Run Comparison", "Compare modal, center", "Starts 6h forward simulation", ACCENT),
    ("15", "X to close Compare", "Compare modal, top-right", "Returns to main dashboard", MUTED),
    ("16", "1H button", "TopBar, right section", "Advances time by 1 hour", ACCENT),
    ("17", "1D button", "TopBar, right section", "Advances time by 24 hours", ORANGE),
    ("18", "Event Log toggle", "Bottom-right of screen", "Shows/hides event log", GREEN),
    ("19", "Resources header", "Right panel header", "Expands resource details", ORANGE),
    ("20", "AI button", "TopBar, right section", "Opens AI chat panel", CYAN),
    ("21", "Assess readiness", "Chat panel, quick action", "Sends readiness query to AI", GREEN),
    ("22", "Type custom question", "Chat panel, input box", "Free-form question to AI", ACCENT),
    ("23", "X to close chat", "Chat panel, top-right", "Closes AI chat panel", MUTED),
    ("24", "Hover each KPI", "KPI strip, below TopBar", "Shows tooltip with formula", ORANGE),
]

ty = H - 148
for i, (num, label, location, effect, color) in enumerate(clicks):
    ry = ty - i * 21
    if i % 2 == 0:
        c.setFillColor(BG_CARD)
        c.rect(55, ry - 4, W - 110, 19, fill=1, stroke=0)
    # Number
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(65, ry, num)
    # Label
    txt(c, 90, ry, label, sz=10, bold=True, color=color)
    # Location
    txt(c, 350, ry, location, sz=9, color=MUTED)
    # Effect
    txt(c, 590, ry, effect, sz=9, color=LIGHT)

sn(c, 15)
c.showPage()


# ── PAGE 16: Backup — What If Things Go Wrong ────────
page_bg(c)
txt(c, 55, H - 50, "BACKUP PLANS", sz=12, color=RED, bold=True)
txt(c, 55, H - 85, "What If Things Go Wrong?", sz=32, bold=True)
txt(c, 55, H - 115, "Contingency plans for common demo failures. Stay calm — every scenario has a recovery.", sz=14, color=LIGHT)

y = H - 160
issues = [
    ("AI API is slow or unresponsive", RED,
     "The app has a DETERMINISTIC FALLBACK PLANNER. It works offline.",
     "Say: 'The AI is thinking... but notice the fallback planner kicks in — critical for defense deployments with no internet.'",
     "Actually a great talking point — shows edge-readiness."),
    ("Backend server crashes", RED,
     "Have a backup: pre-record a 60-second screen recording of the full demo flow.",
     "Say: 'Let me show you this recording of a full session we ran earlier.'",
     "Keep recording on desktop, ready to play."),
    ("AI returns unexpected format", ORANGE,
     "The app wraps unstructured AI responses as a single recommendation card automatically.",
     "Say: 'The system gracefully handles any AI response format.'",
     "This is actually a feature — show graceful degradation."),
    ("Running out of time at 3:30", ORANGE,
     "Skip Compare Mode and Day 4 attack. Jump straight to AI Chat (Step 20).",
     "Say: 'We also have what-if simulation and dynamic events — happy to show in Q&A.'",
     "Prioritize: AI Chat + KPIs + closing slides."),
    ("Running AHEAD of time at 3:30", GREEN,
     "Slow down on Compare Mode. Actually advance to Day 4. Show the attack event in full.",
     "Ask audience: 'Want to see what happens when a cruise missile hits the base?'",
     "Great engagement moment — audience will say yes."),
    ("Browser tab refreshes / crashes", RED,
     "The app saves state. Click 'START COMMAND CENTER' to restart quickly.",
     "Say: 'The system recovers instantly — another reason this is production-ready.'",
     "Game starts from beginning but loads fast."),
]

for title, color, action, say, note in issues:
    card(c, 55, y, W - 110, 75, color, "left")
    txt(c, 75, y - 15, title, sz=13, bold=True, color=color)
    txt(c, 75, y - 35, action, sz=10, color=LIGHT)
    say_badge(c, 75, y - 52, say)
    txt(c, 75, y - 68, note, sz=9, color=DIM)
    y -= 85

sn(c, 16)
c.showPage()


# ── PAGE 17: Pre-Demo Checklist ──────────────────────
page_bg(c)
txt(c, 55, H - 50, "PRE-DEMO CHECKLIST", sz=12, color=GREEN, bold=True)
txt(c, 55, H - 85, "Do This 10 Minutes Before Presenting", sz=32, bold=True)

y = H - 140

checklist = [
    ("Backend running", "Terminal: uvicorn main:app --reload --port 8000", "Verify: http://localhost:8000/docs loads"),
    ("Frontend running", "Terminal: npm run dev (in frontend directory)", "Verify: http://localhost:5173 loads"),
    ("OpenRouter API key set", "Check .env file has OPENROUTER_API_KEY", "Test: Click AI Suggest once, verify response"),
    ("Browser ready", "Chrome/Firefox, full screen (F11), no bookmarks bar", "Clear other tabs, disable notifications"),
    ("PowerPoint ready", "Open AirBaseOps_Pitch.pptx, start from Slide 1", "Presenter mode on second monitor if available"),
    ("App in start state", "Refresh the browser tab — splash screen should show", "Do NOT start the game yet — save that for live demo"),
    ("Screen recording backup", "Record a 60-second demo video (just in case)", "Save to Desktop for quick access"),
    ("Demo guide visible", "This PDF on phone or second monitor", "Have timing cheat sheet (page 14) ready"),
    ("Microphone check", "Speak at normal volume, verify audio", "Project voice — don't talk to the screen"),
    ("Take a breath", "You built something amazing. Own it.", "Smile. Make eye contact. You've got this."),
]

for i, (item, how, verify) in enumerate(checklist):
    ry = y - i * 38
    if i % 2 == 0:
        c.setFillColor(BG_CARD)
        c.rect(55, ry - 10, W - 110, 35, fill=1, stroke=0)
    # Checkbox
    c.setStrokeColor(GREEN)
    c.setLineWidth(1.5)
    c.rect(70, ry - 2, 14, 14, fill=0, stroke=1)
    # Item
    txt(c, 95, ry, item, sz=12, bold=True, color=WHITE)
    txt(c, 300, ry, how, sz=10, color=LIGHT)
    txt(c, 680, ry, verify, sz=9, color=MUTED)

sn(c, 17)
c.showPage()


# ── PAGE 18: Final Notes ─────────────────────────────
page_bg(c)

txt_c(c, 0, H * 0.72, W, "You built something incredible.", sz=32, color=LIGHT)
txt_c(c, 0, H * 0.62, W, "Now go show the judges.", sz=38, bold=True)

card(c, 200, H * 0.42, W - 400, 100, ACCENT)
txt_c(c, 200, H * 0.40, W - 400, "REMEMBER:", sz=14, bold=True, color=ACCENT)
txt_c(c, 200, H * 0.36, W - 400, "The judges ask: 'Would I invest in finishing this product?'", sz=16, color=WHITE)
txt_c(c, 200, H * 0.32, W - 400, "Every click you make in the demo should answer: YES.", sz=16, color=GREEN)

tips = [
    ("Don't rush", "Let features breathe.\nPause after big moments.", ACCENT),
    ("Talk to judges,\nnot the screen", "Make eye contact.\nProject confidence.", GREEN),
    ("Show, don't tell", "Every claim backed by\na live feature demo.", ORANGE),
    ("End strong", "Last words should be\nmemorable and clear.", CYAN),
]

for i, (title, desc, color) in enumerate(tips):
    x = 120 + i * 235
    card(c, x, H * 0.22, 210, 100, color)
    txt_c(c, x, H * 0.20, 210, title.split("\n")[0], sz=14, bold=True, color=color)
    if "\n" in title:
        txt_c(c, x, H * 0.18, 210, title.split("\n")[1], sz=14, bold=True, color=color)
    lines = desc.split("\n")
    for j, line in enumerate(lines):
        txt_c(c, x, H * 0.14 - j * 18, 210, line, sz=12, color=LIGHT)

txt_c(c, 0, 50, W, "AIRBASE OPS  |  Saab Smart Air Base Hackathon  |  March 2026", sz=13, color=MUTED)

sn(c, 18)
c.showPage()


# ── Save ─────────────────────────────────────────────
c.save()
print(f"Demo guide saved to: {OUTPUT}")
print(f"Total pages: {TOTAL}")
