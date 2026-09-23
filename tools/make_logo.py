"""Extract the Heaven Haven lettering from the brand photos (no background)
and compose transparent PNG logos (stacked, wide, and compact nav versions).
Run:  python3 site/tools/make_logo.py
"""
from PIL import Image
import numpy as np
from scipy import ndimage as ndi
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = '/home/user/uploads/723154424_2462941040795197_3375681593183487751_n.jpeg'
OUT = os.path.join(ROOT, 'assets')
os.makedirs(OUT, exist_ok=True)

SCALE = 3
src = Image.open(SRC).convert('RGB')
big = src.resize((src.size[0] * SCALE, src.size[1] * SCALE), Image.LANCZOS)
A = np.array(big).astype(float)
LUM = A.mean(axis=2)
R, G, B = A[..., 0], A[..., 1], A[..., 2]
GREENISH = (G >= R - 10) & (G >= B - 2)


def despeckle(alpha, min_cc, iso_dist=14):
    """Drop connected components smaller than min_cc px ONLY if they are isolated
    (farther than iso_dist px from any bigger component). Keeps periods / i-dots."""
    lab, n = ndi.label(alpha > 0.35)
    if not n:
        return alpha
    sizes = ndi.sum(np.ones_like(alpha), lab, index=np.arange(1, n + 1))
    bigmask = np.isin(lab, np.where(sizes >= min_cc)[0] + 1)
    dist = ndi.distance_transform_edt(~bigmask)
    keep = bigmask.copy()
    for i in np.where(sizes < min_cc)[0]:
        comp = lab == (i + 1)
        if dist[comp].min() <= iso_dist:
            keep |= comp
    keep = ndi.binary_dilation(keep, iterations=2)
    return alpha * keep


def clean(alpha, min_cc, floor=0.12):
    alpha = alpha.copy()
    alpha[alpha < floor] = 0
    alpha = despeckle(alpha, min_cc)
    ys, xs = np.where(alpha > 0.2)
    return alpha[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def extract(box, hi=140, lo=60, min_cc=60, greenish=True, zero_corner=None):
    x0, y0, x1, y1 = [v * SCALE for v in box]
    lum = LUM[y0:y1, x0:x1]
    alpha = np.clip((hi - lum) / (hi - lo), 0, 1)
    if greenish:
        alpha *= GREENISH[y0:y1, x0:x1]
    if zero_corner:
        alpha[:zero_corner[1] * SCALE, :zero_corner[0] * SCALE] = 0
    return clean(alpha, min_cc)


parts = {
    'birds':    extract((1055, 52, 1192, 112), min_cc=60),
    'mount':    extract((690, 82, 1270, 248), min_cc=200, zero_corner=(120, 110)),
    'heaven':   extract((425, 255, 1010, 425), min_cc=400),
    'haven':    extract((1045, 255, 1525, 425), min_cc=400),
    'campsite': extract((570, 445, 1400, 510), min_cc=60),
    'tagline':  extract((660, 518, 1289, 574), hi=100, lo=45, min_cc=40, greenish=False),
}

# leaf ornament: extract, then mirror the left short line to the right side
leaf = extract((875, 575, 1085, 618), hi=88, lo=35, min_cc=12, greenish=False)
h, w = leaf.shape
lower = leaf[h // 3:, :]
lab, n = ndi.label(lower > 0.35)
sizes = ndi.sum(np.ones_like(lower), lab, index=np.arange(1, n + 1))
sprig = lab == (np.argsort(sizes)[::-1][0] + 1)
ys, xs = np.where(sprig)
cxs = (xs.min() + xs.max()) / 2
left_mask = np.zeros_like(lower, bool)
for i in range(n):
    comp = lab == (i + 1)
    cy, cx = np.where(comp)
    if cx.max() < xs.min() - 5 and len(cx) > 30:
        left_mask |= comp
lm = lower * left_mask
mirrored = np.zeros_like(lower)
ly, lx = np.where(lm > 0)
for y_, x_ in zip(ly, lx):
    mx = int(round(2 * cxs - x_))
    if 0 <= mx < w:
        mirrored[y_, mx] = max(mirrored[y_, mx], lm[y_, x_])
mirrored = ndi.gaussian_filter(mirrored, 0.6)
leaf2 = leaf.copy()
leaf2[h // 3:, :] = np.maximum(lower, mirrored)
parts['leaf'] = leaf2


def to_img(alpha, color):
    hh, ww = alpha.shape
    out = np.zeros((hh, ww, 4), dtype=np.uint8)
    out[..., 0], out[..., 1], out[..., 2] = color
    out[..., 3] = (alpha * 255).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def fit(img, width=None, height=None):
    ww, hh = img.size
    s = width / ww if width else height / hh
    return img.resize((max(1, round(ww * s)), max(1, round(hh * s))), Image.LANCZOS)


def trim(canvas, y, pad=12):
    canvas = canvas.crop((0, 0, canvas.size[0], y))
    a = np.array(canvas)[..., 3]
    xs = np.where(a.max(axis=0) > 0)[0]
    return canvas.crop((xs.min() - pad, 0, xs.max() + pad + 1, y))


def scaled_pair(color, total_w):
    heaven = to_img(parts['heaven'], color)
    haven = to_img(parts['haven'], color)
    gap = 44 * SCALE
    total = heaven.size[0] + gap + haven.size[0]
    s = total_w / total
    rs = lambda im: im.resize((round(im.size[0] * s), round(im.size[1] * s)), Image.LANCZOS)
    return rs(heaven), rs(haven), round(gap * s)


def compose_stacked(color, W=1200):
    canvas = Image.new('RGBA', (W, 1400), (0, 0, 0, 0)); cx = W // 2; y = 16
    mount = fit(to_img(parts['mount'], color), width=560)
    birds = fit(to_img(parts['birds'], color), width=110)
    canvas.alpha_composite(birds, (cx + 130, y)); y += birds.size[1] - 28
    canvas.alpha_composite(mount, (cx - mount.size[0] // 2, y)); y += mount.size[1] + 26
    heaven = to_img(parts['heaven'], color); s = 760 / heaven.size[0]; heaven = fit(heaven, width=760)
    haven = to_img(parts['haven'], color)
    haven = haven.resize((round(haven.size[0] * s), round(haven.size[1] * s)), Image.LANCZOS)
    canvas.alpha_composite(heaven, (cx - heaven.size[0] // 2, y)); y += heaven.size[1] + 22
    canvas.alpha_composite(haven, (cx - haven.size[0] // 2, y)); y += haven.size[1] + 40
    camp = fit(to_img(parts['campsite'], color), width=780)
    canvas.alpha_composite(camp, (cx - camp.size[0] // 2, y)); y += camp.size[1] + 34
    tag = fit(to_img(parts['tagline'], color), width=640)
    canvas.alpha_composite(tag, (cx - tag.size[0] // 2, y)); y += tag.size[1] + 22
    lf = fit(to_img(parts['leaf'], color), width=210)
    canvas.alpha_composite(lf, (cx - lf.size[0] // 2, y)); y += lf.size[1] + 16
    return trim(canvas, y)


def compose_wide(color, W=1500):
    canvas = Image.new('RGBA', (W, 700), (0, 0, 0, 0)); cx = W // 2; y = 10
    birds = fit(to_img(parts['birds'], color), width=110)
    mount = fit(to_img(parts['mount'], color), width=520)
    canvas.alpha_composite(birds, (cx + 150, y)); y += birds.size[1] - 24
    canvas.alpha_composite(mount, (cx - mount.size[0] // 2, y)); y += mount.size[1] + 18
    heaven, haven, gap = scaled_pair(color, 1200)
    x0 = cx - (heaven.size[0] + gap + haven.size[0]) // 2
    canvas.alpha_composite(heaven, (x0, y)); canvas.alpha_composite(haven, (x0 + heaven.size[0] + gap, y))
    y += heaven.size[1] + 26
    camp = fit(to_img(parts['campsite'], color), width=900)
    canvas.alpha_composite(camp, (cx - camp.size[0] // 2, y)); y += camp.size[1] + 24
    tag = fit(to_img(parts['tagline'], color), width=700)
    canvas.alpha_composite(tag, (cx - tag.size[0] // 2, y)); y += tag.size[1] + 16
    lf = fit(to_img(parts['leaf'], color), width=220)
    canvas.alpha_composite(lf, (cx - lf.size[0] // 2, y)); y += lf.size[1] + 12
    return trim(canvas, y)


def compose_nav(color, W=1500):
    canvas = Image.new('RGBA', (W, 600), (0, 0, 0, 0)); cx = W // 2; y = 10
    mount = fit(to_img(parts['mount'], color), width=420)
    canvas.alpha_composite(mount, (cx - mount.size[0] // 2, y)); y += mount.size[1] + 14
    heaven, haven, gap = scaled_pair(color, 1200)
    x0 = cx - (heaven.size[0] + gap + haven.size[0]) // 2
    canvas.alpha_composite(heaven, (x0, y)); canvas.alpha_composite(haven, (x0 + heaven.size[0] + gap, y))
    y += heaven.size[1] + 22
    camp = fit(to_img(parts['campsite'], color), width=900)
    canvas.alpha_composite(camp, (cx - camp.size[0] // 2, y)); y += camp.size[1] + 10
    return trim(canvas, y)


GREEN = (0x1e, 0x3a, 0x22)
WHITE = (255, 255, 255)
compose_stacked(GREEN).save(f'{OUT}/logo.png')
compose_stacked(WHITE).save(f'{OUT}/logo-white.png')
compose_wide(GREEN).save(f'{OUT}/logo-wide.png')
compose_wide(WHITE).save(f'{OUT}/logo-wide-white.png')
compose_nav(GREEN).save(f'{OUT}/logo-nav.png')
compose_nav(WHITE).save(f'{OUT}/logo-nav-white.png')
# favicon-ish square mark (mountains + HEAVEN HAVEN)
mark = compose_nav(GREEN)
sq = Image.new('RGBA', (mark.size[0], mark.size[0]), (0, 0, 0, 0))
sq.alpha_composite(mark, (0, (mark.size[0] - mark.size[1]) // 2))
sq.resize((256, 256), Image.LANCZOS).save(f'{OUT}/favicon.png')
src.save(f'{OUT}/hero.jpg', quality=88, optimize=True)
print('done:', sorted(os.listdir(OUT)))
