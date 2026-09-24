"""Builds the static preview site.

Each page in src/pages/ starts with a meta comment:
  <!--meta title=... | desc=... | cur=freight | service=freight -->
and is wrapped with src/_top.html and src/_bottom.html. Run: python build.py
"""
import hashlib, pathlib, re

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
WA_NUMBER = "12818399567"
WA = f"https://wa.me/{WA_NUMBER}?text=Hello%20SG%20Resources%2C%20I%27d%20like%20a%20quote."
WA_ICON = ('<svg class="wa-ico" viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.6a10.6 10.6 0 0 1-5.4-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.6 10.6 0 1 1 16 26.6zm5.8-7.9c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8 1 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.3z"/></svg>')

HEAD = """<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="img/logo-mark.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Source+Sans+3:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
<link rel="stylesheet" href="assets/site.css?v={css_v}">
</head>
<body>
"""
FOOT = """
<script src="assets/site.js?v={js_v}"></script>
</body>
</html>
"""

SERVICE_PAGES = [
    ("freight", "freight-forwarding.html", "Freight forwarding", "Air and sea freight from Houston"),
    ("vehicles", "vehicles.html", "Vehicles & titles", "Dealer sales, title work and vehicle export"),
    ("procurement", "procurement.html", "Procurement", "We find, negotiate and verify for you"),
    ("warehousing", "warehousing.html", "Warehousing", "Houston storage, packing and loading"),
    ("construction", "construction.html", "Construction", "Residential and commercial projects"),
    ("other", "other-services.html", "Marketing & more", "Branding, notary and DOT drug testing"),
]

def more_block(cur):
    cards = "".join(
        f'<a class="svc-card" href="{href}"><b>{name.replace("&", "&amp;")}</b><span>{blurb}</span><i>See details →</i></a>'
        for key, href, name, blurb in SERVICE_PAGES if key != cur)
    return ('<section class="block"><div class="wrap"><div class="sec-head"><div><p class="eyebrow">More from SG Resources</p>'
            '<h2>Other services</h2></div><p>Many customers use more than one service. For example, they have us buy a vehicle, title it and ship it.</p></div>'
            f'<div class="svc-grid">{cards}</div></div></section>\n')

def render(text, cur, service):
    text = text.replace("{{MORE}}", more_block(cur))
    text = text.replace("{{WA}}", WA).replace("{{WA_ICON}}", WA_ICON)
    text = text.replace("{{Q}}", f"?service={service}" if service else "")
    def cur_sub(m):
        return ' aria-current="page"' if m.group(1) == cur else ""
    return re.sub(r"\{\{CUR:(\w+)\}\}", cur_sub, text)

def version(path):
    # content hash so browsers fetch fresh CSS/JS after every change
    return hashlib.sha1((ROOT / path).read_bytes()).hexdigest()[:8]

CSS_V, JS_V = version("assets/site.css"), version("assets/site.js")

top = (SRC / "_top.html").read_text(encoding="utf-8")
bottom = (SRC / "_bottom.html").read_text(encoding="utf-8")

for page in sorted((SRC / "pages").glob("*.html")):
    raw = page.read_text(encoding="utf-8")
    m = re.match(r"<!--meta(.*?)-->\s*", raw, flags=re.S)
    assert m, f"{page.name}: missing <!--meta ... --> header"
    meta = dict(
        (k.strip(), v.strip())
        for k, v in (part.split("=", 1) for part in m.group(1).split("|") if "=" in part)
    )
    body = raw[m.end():]
    cur, service = meta.get("cur", ""), meta.get("service", "")
    html = (HEAD.format(title=meta["title"], desc=meta.get("desc", ""), css_v=CSS_V)
            + render(top, cur, service)
            + '\n<main id="top">\n' + render(body, cur, service) + "</main>\n\n"
            + render(bottom, cur, service) + FOOT.format(js_v=JS_V))
    assert "{{" not in html, f"{page.name}: unreplaced token"
    (ROOT / page.name).write_text(html, encoding="utf-8")
    print("built", page.name)
