import sys, os, random, math
sys.stdout.reconfigure(encoding='utf-8')

from PIL import Image, ImageDraw, ImageFont

FONTS = "C:/Users/adity/AppData/Roaming/Claude/local-agent-mode-sessions/skills-plugin/3c2e4139-b5d9-482f-8b2f-a40e603f938e/628d41e1-cb38-4b71-86a0-100a22872974/skills/canvas-design/canvas-fonts"
OUT   = "C:/Users/adity/OneDrive/Desktop/EduLaw Notes V2/carousel"
os.makedirs(OUT, exist_ok=True)

BURGUNDY  = (107, 30, 46)
BURG_D    = (72, 14, 26)
BURG_L    = (139, 46, 66)
GOLD      = (201, 168, 76)
GOLD_L    = (232, 201, 122)
GOLD_D    = (150, 118, 45)
PARCHMENT = (245, 240, 232)
PARCH_D   = (230, 220, 200)
INK       = (18, 18, 18)
WHITE     = (255, 255, 255)
NAVY      = (22, 38, 68)
NAVY_L    = (35, 58, 100)
OFF_WHITE = (252, 248, 242)

W = H = 1080

def f(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)

SERIF_B  = "IBMPlexSerif-Bold.ttf"
SERIF_BI = "IBMPlexSerif-BoldItalic.ttf"
SERIF_R  = "IBMPlexSerif-Regular.ttf"
SANS_B   = "InstrumentSans-Bold.ttf"
SANS_BI  = "InstrumentSans-BoldItalic.ttf"
SANS_R   = "InstrumentSans-Regular.ttf"

def grain(img):
    random.seed(77)
    g = Image.new("RGBA", (W, H), (0,0,0,0))
    gd = ImageDraw.Draw(g)
    for _ in range(14000):
        x = random.randint(0, W-1); y = random.randint(0, H-1)
        gd.point((x, y), fill=(160, 140, 100, random.randint(4, 12)))
    return Image.alpha_composite(img.convert("RGBA"), g).convert("RGB")

def base(bg=PARCHMENT):
    img = Image.new("RGB", (W, H), bg)
    return grain(img)

def tlen(d, txt, font):
    return d.textlength(txt, font=font)

def center_x(d, txt, font, y, color, img_draw=None):
    draw = img_draw or d
    w = tlen(draw, txt, font)
    draw.text(((W - w) // 2, y), txt, font=font, fill=color)

def pill(d, x, y, txt, bg, fg, pad=14, h=30, radius=15):
    tw = tlen(d, txt, f(SANS_B, 12))
    d.rounded_rectangle([x, y, x + tw + pad*2, y + h], radius=radius, fill=bg)
    d.text((x + pad, y + (h - 14)//2 + 1), txt, font=f(SANS_B, 12), fill=fg)
    return tw + pad*2

def logo_badge(d, cx, cy, r=36):
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=BURGUNDY)
    d.ellipse([cx-r+3, cy-r+3, cx+r-3, cy+r-3], outline=GOLD, width=2)
    lf = f(SERIF_B, r+4)
    bb = d.textbbox((0,0),"E",font=lf)
    tw = bb[2]-bb[0]; th = bb[3]-bb[1]
    d.text((cx - tw//2, cy - th//2 - 2), "E", font=lf, fill=GOLD)

def header(d, img, bg=BURG_D, num=None):
    d.rectangle([0, 0, W, 100], fill=bg)
    d.rectangle([0, 100, W, 105], fill=GOLD)
    logo_badge(d, 60, 50, r=32)
    # wordmark
    bf = f(SERIF_B, 30); bif = f(SERIF_BI, 30); sf = f(SANS_R, 11)
    d.text((108, 22), "The Edu", font=bf, fill=PARCHMENT)
    ew = tlen(d, "The Edu", bf)
    d.text((108 + ew, 22), "Law", font=bif, fill=GOLD)
    lw = tlen(d, "Law", bif)
    d.text((108 + ew + lw + 6, 32), "STORE", font=sf, fill=GOLD_L)
    # slide num
    if num:
        nf = f(SANS_R, 13)
        nt = f"{num[0]} / {num[1]}"
        nw = tlen(d, nt, nf)
        d.text((W - nw - 28, 42), nt, font=nf, fill=(200, 180, 145))

def footer(d, tagline=None):
    d.rectangle([0, H-72, W, H], fill=BURG_D)
    d.rectangle([0, H-76, W, H-72], fill=GOLD)
    uf = f(SERIF_BI, 22)
    ut = "store.theedulaw.in"
    uw = tlen(d, ut, uf)
    d.text(((W - uw)//2, H - 54), ut, font=uf, fill=GOLD_L)
    if tagline:
        tf = f(SANS_R, 11)
        tw = tlen(d, tagline, tf)
        d.text(((W - tw)//2, H - 24), tagline, font=tf, fill=(170, 148, 108))

def rule(d, x0, y, x1, col=GOLD, h=3):
    d.rectangle([x0, y, x1, y+h], fill=col)

def card(d, x0, y0, x1, y1, fill=WHITE, r=14, bar=None):
    # soft shadow
    for i in range(5, 0, -1):
        d.rounded_rectangle([x0+i, y0+i, x1+i, y1+i], radius=r,
                             fill=(210, 195, 175))
    d.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=fill)
    if bar:
        d.rounded_rectangle([x0, y0, x0+6, y1], radius=r, fill=bar)

# ════════════════════════════════════════════
# SLIDE 1 — COVER
# ════════════════════════════════════════════
def s1():
    img = Image.new("RGB", (W, H), BURG_D)
    img = grain(img)
    d = ImageDraw.Draw(img)

    # subtle diagonal lines
    for i in range(-300, W+300, 55):
        d.line([(i, 0), (i + H, H)], fill=(255,255,255,6), width=1)

    # concentric circles
    for r, a in [(480,12),(400,18),(310,22),(220,28)]:
        layer = Image.new("RGBA",(W,H),(0,0,0,0))
        ld = ImageDraw.Draw(layer)
        ld.ellipse([W//2-r, H//2-r+80, W//2+r, H//2+r+80], outline=(*GOLD, a), width=1)
        img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
    d = ImageDraw.Draw(img)

    header(d, img, BURG_D, (1,8))

    # pill label
    pill(d, (W - pill(d, 0, 0, "INDIA'S #1 LEGAL EDUCATION PLATFORM", GOLD, BURG_D))//2, 128,
         "INDIA'S #1 LEGAL EDUCATION PLATFORM", GOLD, BURG_D)

    # Main headline — huge
    h1 = f(SERIF_B, 108)
    h2 = f(SERIF_BI, 108)
    center_x(d, "Legal", h1, 176, PARCHMENT)
    center_x(d, "Study", h2, 286, GOLD)
    center_x(d, "Platform.", h1, 396, PARCHMENT)

    rule(d, 160, 520, W-160, GOLD, 2)

    # sub tagline
    center_x(d, "Notes  ·  Templates  ·  Mock Tests  ·  Subscriptions",
              f(SANS_R, 22), 536, (210, 190, 158))

    # Stats row
    stats = [("46+", "Subjects"), ("10,000+", "Students"), ("100+", "Templates")]
    sw = 260; sh = 110; sgap = 24
    total = len(stats)*sw + (len(stats)-1)*sgap
    sx = (W - total)//2
    for i,(num,lbl) in enumerate(stats):
        px = sx + i*(sw+sgap); py = 590
        layer = Image.new("RGBA",(W,H),(0,0,0,0))
        ld = ImageDraw.Draw(layer)
        ld.rounded_rectangle([px,py,px+sw,py+sh], radius=16, fill=(255,255,255,20))
        img = Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")
        d = ImageDraw.Draw(img)
        nf = f(SERIF_B, 46); lf2 = f(SANS_R, 15)
        nw = tlen(d, num, nf); lw = tlen(d, lbl, lf2)
        d.text((px+(sw-nw)//2, py+10), num, font=nf, fill=GOLD)
        d.text((px+(sw-lw)//2, py+66), lbl, font=lf2, fill=(200,180,148))

    # CTA button
    cta = "Swipe to Explore  →"
    cf = f(SANS_B, 22)
    cw = tlen(d, cta, cf)
    bx = (W-cw)//2 - 30
    d.rounded_rectangle([bx, 730, bx+cw+60, 778], radius=24, fill=GOLD)
    d.text((bx+30, 742), cta, font=cf, fill=BURG_D)

    # trust text
    center_x(d, "✦  Trusted by Law Students · Lawyers · UPSC Aspirants  ✦",
              f(SANS_R, 14), 800, (175, 150, 108))

    footer(d, "© 2025 The EduLaw Store  ·  Premium Legal Education  ·  India")
    img.save(f"{OUT}/slide_01_cover.png", "PNG", dpi=(300,300))
    print("✓ Slide 1 — Cover")

# ════════════════════════════════════════════
# SLIDE 2 — MARKETPLACE
# ════════════════════════════════════════════
def s2():
    img = base(PARCHMENT)
    d = ImageDraw.Draw(img)
    header(d, img, BURG_D, (2,8))
    footer(d, "Swipe for more  →")

    pill(d, 54, 122, "MARKETPLACE", BURGUNDY, PARCHMENT)
    d.text((54, 166), "Your Legal Library,", font=f(SERIF_B, 58), fill=INK)
    d.text((54, 234), "All in One Place.", font=f(SERIF_BI, 58), fill=BURGUNDY)
    rule(d, 54, 308, 480, GOLD, 3)
    d.text((54, 320), "46+ subjects  ·  CLAT  ·  LLB  ·  Judiciary  ·  UPSC",
           font=f(SANS_R, 17), fill=(100, 82, 58))

    # 3×3 category cards
    cats = [
        ("Constitutional Law","CLAT · Judiciary · UPSC","from ₹199"),
        ("Criminal Law","IPC · BNS · CrPC · Evidence","from ₹199"),
        ("Contract Law","LLB · Bar Exam Prep","from ₹199"),
        ("International Law","PIL · ICJ · Treaties","from ₹249"),
        ("Corporate Law","Companies Act 2013","from ₹249"),
        ("Family Law","Hindu · Muslim · Special","from ₹199"),
        ("Property Law","Transfer of Property Act","from ₹199"),
        ("Admin Law","APA · Writs · Tribunals","from ₹199"),
        ("Jurisprudence","Legal Theory · Philosophy","from ₹199"),
    ]
    cw2=298; ch2=116; gap2=12; sx2=54; sy2=355
    for i,(title,sub,price) in enumerate(cats):
        col=i%3; row=i//3
        x0=sx2+col*(cw2+gap2); y0=sy2+row*(ch2+gap2)
        card(d, x0,y0,x0+cw2,y0+ch2, WHITE, 12, BURGUNDY if i==0 else GOLD)
        d.text((x0+18, y0+14), title, font=f(SERIF_B, 17), fill=INK)
        d.text((x0+18, y0+40), sub,  font=f(SANS_R, 11),  fill=(120,98,72))
        rule(d, x0+18, y0+60, x0+cw2-18, PARCH_D, 1)
        d.text((x0+18, y0+72), price, font=f(SERIF_B, 16), fill=BURGUNDY)

    img.save(f"{OUT}/slide_02_marketplace.png","PNG",dpi=(300,300))
    print("✓ Slide 2 — Marketplace")

# ════════════════════════════════════════════
# SLIDE 3 — BUNDLE BUILDER
# ════════════════════════════════════════════
def s3():
    img = base(PARCHMENT)
    d = ImageDraw.Draw(img)
    header(d, img, BURG_D, (3,8))
    footer(d, "Swipe for more  →")

    pill(d, 54, 122, "BUNDLE BUILDER", GOLD, BURG_D)
    d.text((54, 166), "Build Your Bundle.", font=f(SERIF_B, 60), fill=INK)
    d.text((54, 236), "Save Up to 20%.", font=f(SERIF_BI, 60), fill=BURGUNDY)
    rule(d, 54, 312, 500, GOLD, 3)
    d.text((54, 324), "Pick any notes · Discount auto-applied at checkout",
           font=f(SANS_R, 17), fill=(100,82,58))

    # Tier cards
    tiers = [
        ("1 Note",    "₹199",  "No Discount",   PARCH_D, INK,     GOLD_D,  False),
        ("2–9 Notes", "₹169",  "15% OFF",        BURGUNDY, PARCHMENT, GOLD_L, False),
        ("10+ Notes", "₹159",  "20% OFF",        GOLD,     BURG_D,  BURG_D,  True),
    ]
    tw3=296; th3=240; tgap=16
    total = len(tiers)*tw3 + (len(tiers)-1)*tgap
    tx = (W-total)//2; ty=370
    for i,(count,price,disc,bg,fg,dcolor,best) in enumerate(tiers):
        x0=tx+i*(tw3+tgap)
        card(d, x0,ty,x0+tw3,ty+th3, bg, 16)
        if best:
            pill(d, x0+tw3-120, ty-18, "BEST VALUE", BURGUNDY, PARCHMENT)
        # count label
        d.text((x0+20, ty+18), count.upper(), font=f(SANS_B, 13), fill=fg)
        # big price
        pf3 = f(SERIF_B, 52)
        pw3 = tlen(d, price, pf3)
        d.text((x0+(tw3-pw3)//2, ty+50), price, font=pf3, fill=fg)
        d.text((x0+20, ty+116), "per note avg.", font=f(SANS_R,12), fill=fg)
        rule(d, x0+20, ty+140, x0+tw3-20, dcolor if bg!=PARCH_D else PARCH_D, 1)
        # disc text
        df3=f(SERIF_BI,28)
        dw3=tlen(d, disc, df3)
        d.text((x0+(tw3-dw3)//2, ty+152), disc, font=df3, fill=dcolor)

    # How it works flow
    rule(d, 54, 638, W-54, PARCH_D, 1)
    d.text((54, 652), "How it works:", font=f(SERIF_B, 22), fill=INK)
    steps=["Browse notes","Add to builder","Discount applied","Checkout & save"]
    ssx=54
    for i,st in enumerate(steps):
        sw2=200; sh2=46
        card(d, ssx,690,ssx+sw2,690+sh2, WHITE, 10)
        stw=tlen(d, st, f(SANS_R, 13))
        d.text((ssx+(sw2-stw)//2,702), st, font=f(SANS_R,13), fill=INK)
        d.rounded_rectangle([ssx,690,ssx+5,690+sh2],radius=3,fill=GOLD)
        if i<3:
            d.text((ssx+sw2+6,701),"→",font=f(SERIF_B,22),fill=GOLD)
        ssx += sw2+30

    d.text((54,758),"✓  Any subjects   ✓  Real prices   ✓  Instant savings",
           font=f(SANS_R,15), fill=(100,82,58))

    img.save(f"{OUT}/slide_03_bundles.png","PNG",dpi=(300,300))
    print("✓ Slide 3 — Bundle Builder")

# ════════════════════════════════════════════
# SLIDE 4 — LEGAL PLAYGROUND
# ════════════════════════════════════════════
def s4():
    img = Image.new("RGB",(W,H),NAVY)
    img = grain(img)
    d = ImageDraw.Draw(img)

    # grid lines
    for x in range(0,W,72):
        layer=Image.new("RGBA",(W,H),(0,0,0,0))
        ld=ImageDraw.Draw(layer)
        ld.line([(x,0),(x,H)],fill=(255,255,255,10),width=1)
        img=Image.alpha_composite(img.convert("RGBA"),layer).convert("RGB")
    for y in range(0,H,72):
        layer=Image.new("RGBA",(W,H),(0,0,0,0))
        ld=ImageDraw.Draw(layer)
        ld.line([(0,y),(W,y)],fill=(255,255,255,10),width=1)
        img=Image.alpha_composite(img.convert("RGBA"),layer).convert("RGB")
    d = ImageDraw.Draw(img)

    header(d,img,NAVY,(4,8))
    footer(d,"Swipe for more  →")

    pill(d,54,122,"LEGAL PLAYGROUND",GOLD,BURG_D)

    # MASSIVE tagline stacked
    d.text((54,170),"Draft.",   font=f(SERIF_B,100),  fill=PARCHMENT)
    d.text((54,278),"Argue.",   font=f(SERIF_BI,100), fill=GOLD)
    d.text((54,386),"Master.",  font=f(SERIF_B,100),  fill=PARCHMENT)

    rule(d, 54,500, W-54, GOLD, 2)
    d.text((54,514),"India's interactive legal drafting sandbox",
           font=f(SANS_R,20),fill=(200,188,165))

    feats=[
        ("✍","Draft petitions, contracts & plaints"),
        ("⚖","Moot court argument builder"),
        ("⚙","Format-perfect document output"),
        ("🔎","AI-assisted legal research tools"),
    ]
    fy=560
    for ico,txt in feats:
        layer=Image.new("RGBA",(W,H),(0,0,0,0))
        ld=ImageDraw.Draw(layer)
        ld.rounded_rectangle([54,fy,W-54,fy+58],radius=12,fill=(255,255,255,14))
        img=Image.alpha_composite(img.convert("RGBA"),layer).convert("RGB")
        d=ImageDraw.Draw(img)
        d.rounded_rectangle([54,fy,61,fy+58],radius=3,fill=GOLD)
        d.text((80,fy+16),f"{ico}  {txt}",font=f(SANS_R,18),fill=PARCHMENT)
        fy+=70

    img.save(f"{OUT}/slide_04_playground.png","PNG",dpi=(300,300))
    print("✓ Slide 4 — Legal Playground")

# ════════════════════════════════════════════
# SLIDE 5 — TEMPLATE STORE
# ════════════════════════════════════════════
def s5():
    img = base(PARCHMENT)
    d = ImageDraw.Draw(img)
    header(d,img,BURG_D,(5,8))
    footer(d,"Swipe for more  →")

    pill(d,54,122,"TEMPLATE STORE",BURGUNDY,PARCHMENT)
    d.text((54,166),"Professional Legal", font=f(SERIF_B,56), fill=INK)
    d.text((54,232),"Drafts. Ready Now.", font=f(SERIF_BI,56), fill=BURGUNDY)
    rule(d, 54,305,520,GOLD,3)
    d.text((54,318),"Download · Customise · File — Save hours of drafting.",
           font=f(SANS_R,17),fill=(100,82,58))

    templates=[
        ("Bail Application","Criminal Law","Court-ready format"),
        ("Legal Notice","Civil / Commercial","Customisable"),
        ("Affidavit","General Purpose","Notary-ready"),
        ("Writ Petition","Constitutional","HC & SC format"),
        ("Partnership Deed","Corporate Law","2013 Act compliant"),
        ("NDA Agreement","Contract Law","Modern format"),
    ]
    cw5=298; ch5=144; gap5=14; sx5=54; sy5=356
    for i,(title,cat,tag) in enumerate(templates):
        col=i%3; row=i//3
        x0=sx5+col*(cw5+gap5); y0=sy5+row*(ch5+gap5)
        card(d,x0,y0,x0+cw5,y0+ch5,WHITE,12,BURGUNDY)
        # folded gold corner
        d.polygon([(x0+cw5-32,y0),(x0+cw5,y0),(x0+cw5,y0+32)],fill=GOLD)
        d.text((x0+18,y0+16),title,font=f(SERIF_B,18),fill=INK)
        d.text((x0+18,y0+44),cat,  font=f(SANS_R,12), fill=(130,106,78))
        rule(d, x0+18,y0+66,x0+cw5-18,PARCH_D,1)
        # ruled lines
        for li in range(2):
            rule(d,x0+18,y0+78+li*14,x0+cw5-18,PARCH_D,1)
        pill(d,x0+18,y0+ch5-36,tag,GOLD,BURG_D,10,26,13)

    img.save(f"{OUT}/slide_05_templates.png","PNG",dpi=(300,300))
    print("✓ Slide 5 — Template Store")

# ════════════════════════════════════════════
# SLIDE 6 — LEGAL UPDATES
# ════════════════════════════════════════════
def s6():
    img = base(PARCHMENT)
    d = ImageDraw.Draw(img)
    header(d,img,BURG_D,(6,8))
    footer(d,"Swipe for more  →")

    pill(d,54,122,"LEGAL UPDATES",NAVY,PARCHMENT)
    d.text((54,166),"Stay Current.", font=f(SERIF_B,62), fill=INK)
    d.text((54,238),"Stay Ahead.",   font=f(SERIF_BI,62), fill=BURGUNDY)
    rule(d,54,318,430,GOLD,3)
    d.text((54,330),"Latest judgments · Amendments · Legal news daily",
           font=f(SANS_R,17),fill=(100,82,58))

    updates=[
        ("Supreme Court","BNS 2023 — Key Provisions Explained",
         "New criminal code replacing IPC — what every law student must know","2025"),
        ("Parliament","Consumer Protection (E-Commerce) Rules",
         "Updated liability framework for online platforms & marketplaces","2025"),
        ("UPSC Law","Judiciary Exam — Updated Syllabus & Pattern",
         "New weightage breakdown for prelims and mains law papers","2025"),
        ("High Court","Property Registration — State-wise Updates",
         "Stamp duty revisions across Maharashtra, Delhi, Karnataka","2025"),
    ]
    uy=378; uh=136; ugap=14
    for (court,title,desc,yr) in updates:
        uw2=W-108
        card(d,54,uy,54+uw2,uy+uh,WHITE,12,BURGUNDY)
        pill(d,72,uy+16,court.upper(),PARCH_D,BURGUNDY,10,24,12)
        # year right
        yf=f(SANS_B,12)
        yw=tlen(d,yr,yf)
        d.text((54+uw2-yw-18,uy+18),yr,font=yf,fill=GOLD_D)
        d.text((72,uy+50),title,font=f(SERIF_B,20),fill=INK)
        d.text((72,uy+80),desc, font=f(SANS_R,13),fill=(100,82,58))
        uy += uh+ugap

    img.save(f"{OUT}/slide_06_updates.png","PNG",dpi=(300,300))
    print("✓ Slide 6 — Legal Updates")

# ════════════════════════════════════════════
# SLIDE 7 — SUBSCRIPTION
# ════════════════════════════════════════════
def s7():
    img = Image.new("RGB",(W,H),BURG_D)
    img = grain(img)
    # gold glow bottom
    for r7 in range(500,0,-20):
        layer=Image.new("RGBA",(W,H),(0,0,0,0))
        ld=ImageDraw.Draw(layer)
        a=max(0,int(8*(1-r7/500)))
        ld.ellipse([W//2-r7,H-r7,W//2+r7,H+r7],fill=(*GOLD,a))
        img=Image.alpha_composite(img.convert("RGBA"),layer).convert("RGB")
    d=ImageDraw.Draw(img)

    header(d,img,BURG_D,(7,8))
    footer(d,"Swipe for more  →")

    pill(d,54,122,"SUBSCRIPTION",GOLD,BURG_D)
    d.text((54,166),"Unlimited Access.", font=f(SERIF_B,62),fill=PARCHMENT)
    d.text((54,238),"One Flat Price.",   font=f(SERIF_BI,62),fill=GOLD)
    rule(d,54,318,420,GOLD,2)
    d.text((54,330),"Everything you need · No hidden costs · Cancel anytime",
           font=f(SANS_R,17),fill=(210,190,160))

    plans=[
        ("Monthly Plan","₹499","/ month",
         ["Full notes access","All templates","Mock tests","Legal updates"],
         (80,25,38), PARCHMENT, GOLD, False),
        ("Yearly Plan", "₹3,999","/ year",
         ["Everything in Monthly","+Priority support","+Offline downloads","+New content first"],
         GOLD, BURG_D, BURG_D, True),
    ]
    pw7=440; ph7=340; pgap=20
    total=len(plans)*pw7+(len(plans)-1)*pgap
    px7=(W-total)//2; py7=370
    for i,(name,price,period,feats,bg,fg,fc,best) in enumerate(plans):
        x0=px7+i*(pw7+pgap)
        card(d,x0,py7,x0+pw7,py7+ph7,bg,18)
        if best:
            pill(d,x0+pw7-128,py7-18,"SAVE 33%",BURGUNDY,PARCHMENT,12,28,14)
        d.text((x0+24,py7+20),name,font=f(SANS_B,15),fill=fg)
        pf7=f(SERIF_B,56)
        pw8=tlen(d,price,pf7)
        d.text((x0+(pw7-pw8)//2,py7+52),price,font=pf7,fill=fg)
        perf=f(SANS_R,14)
        pew=tlen(d,period,perf)
        d.text((x0+(pw7-pew)//2,py7+116),period,font=perf,fill=fc)
        rule(d,x0+24,py7+142,x0+pw7-24,fc,1)
        for fi,fl in enumerate(feats):
            d.text((x0+24,py7+156+fi*44),"✓  "+fl,font=f(SANS_R,15),fill=fg)

    img.save(f"{OUT}/slide_07_subscription.png","PNG",dpi=(300,300))
    print("✓ Slide 7 — Subscription")

# ════════════════════════════════════════════
# SLIDE 8 — CTA
# ════════════════════════════════════════════
def s8():
    img = Image.new("RGB",(W,H),BURG_D)
    img = grain(img)
    # gold radial centre
    for r8 in range(600,0,-20):
        layer=Image.new("RGBA",(W,H),(0,0,0,0))
        ld=ImageDraw.Draw(layer)
        a=max(0,int(7*(1-r8/600)))
        ld.ellipse([W//2-r8,H//2-r8,W//2+r8,H//2+r8],fill=(*GOLD,a))
        img=Image.alpha_composite(img.convert("RGBA"),layer).convert("RGB")
    d=ImageDraw.Draw(img)

    header(d,img,BURG_D)

    # big seal centre
    cx8,cy8=W//2,370
    logo_badge(d,cx8,cy8,r=88)
    for r9,a9 in [(130,30),(170,18),(220,10)]:
        d.ellipse([cx8-r9,cy8-r9,cx8+r9,cy8+r9],outline=(*GOLD,a9),width=1)

    d.text(((W-tlen(d,"Start Your",       f(SERIF_B,74)))//2, 496),
           "Start Your",        font=f(SERIF_B,74),  fill=PARCHMENT)
    d.text(((W-tlen(d,"Legal Journey",    f(SERIF_BI,74)))//2,578),
           "Legal Journey",     font=f(SERIF_BI,74), fill=GOLD)
    d.text(((W-tlen(d,"Today.",           f(SERIF_B,74)))//2, 660),
           "Today.",            font=f(SERIF_B,74),  fill=PARCHMENT)

    rule(d,120,754,W-120,GOLD,2)

    # URL
    uf8=f(SERIF_BI,34)
    ut8="store.theedulaw.in"
    uw8=tlen(d,ut8,uf8)
    d.text(((W-uw8)//2,768),ut8,font=uf8,fill=GOLD_L)

    # feature row
    fr="📚 Notes  ·  📄 Templates  ·  ⚖ Playground  ·  ♛ Subscription"
    frw=tlen(d,fr,f(SANS_R,14))
    d.text(((W-frw)//2,820),fr,font=f(SANS_R,14),fill=(200,178,138))

    # trust badge
    tt8="★  Trusted by 10,000+ Law Students Across India  ★"
    tf8=f(SANS_B,14)
    tw8=tlen(d,tt8,tf8)
    d.rounded_rectangle([(W-tw8)//2-24,860,(W+tw8)//2+24,898],radius=20,fill=GOLD)
    d.text(((W-tw8)//2,870),tt8,font=tf8,fill=BURG_D)

    # handle
    hf8=f(SANS_R,15)
    ht8="@theedulaw"
    hw8=tlen(d,ht8,hf8)
    d.text(((W-hw8)//2,914),ht8,font=hf8,fill=(180,155,108))

    footer(d,"© 2025 The EduLaw Store  ·  India")
    img.save(f"{OUT}/slide_08_cta.png","PNG",dpi=(300,300))
    print("✓ Slide 8 — CTA")

s1(); s2(); s3(); s4(); s5(); s6(); s7(); s8()
print(f"\nAll 8 slides → {OUT}")
