"""Generate stable Windows resources from the transparent logo-1024.png export."""
from pathlib import Path
from shutil import copyfile
import re
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Image.open(ROOT / 'icons/branding/logo-1024.png').convert('RGBA')
WIN = ROOT / 'src/stable/resources/win32'
SIZES = [(n, n) for n in (16, 20, 24, 32, 48, 64, 96, 128, 256)]


def stamp(size, logo_size, position=None, transparent=False):
    background = (0, 0, 0, 0) if transparent else (255, 255, 255, 255)
    canvas = Image.new('RGBA', size, background)
    logo = SOURCE.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    if position is None:
        position = ((size[0] - logo_size) // 2, (size[1] - logo_size) // 2)
    canvas.alpha_composite(logo, position)
    return canvas


def generate_letterpress():
    """Use the custom vector mark for the empty editor in every theme."""
    svg = (ROOT / 'icons/branding/logo.svg').read_text(encoding='utf-8')
    media = ROOT / 'src/stable/src/vs/workbench/browser/parts/editor/media'
    variants = {
        'light': ('#B2B2B2', '0.1'),
        'dark': ('#B2B2B2', '0.3'),
        'hcLight': ('#B2B2B2', '1'),
        'hcDark': ('#3C3C3C', '1'),
    }
    for theme, (color, opacity) in variants.items():
        mark = re.sub(r'fill="#[0-9a-fA-F]+"', f'fill="{color}" fill-opacity="{opacity}"', svg)
        mark = mark.replace('<title>Nanjing Zizheng Zhixin</title>', '<title>6GPRT</title>')
        (media / f'letterpress-{theme}.svg').write_text(mark, encoding='utf-8', newline='\n')


def main():
    generate_letterpress()
    copyfile(ROOT / 'icons/branding/logo.svg', ROOT / 'src/stable/resources/linux/code.svg')
    copyfile(ROOT / 'icons/branding/logo-1024.png', ROOT / 'src/stable/resources/linux/code.png')
    SOURCE.resize((256, 256), Image.Resampling.LANCZOS).save(WIN / 'code.ico', sizes=SIZES)
    stamp((70, 70), 70, transparent=True).save(WIN / 'code_70x70.png')
    stamp((150, 150), 150, transparent=True).save(WIN / 'code_150x150.png')
    # Keep the file-type pictogram and replace its branding badge.
    for path in sorted(WIN.glob('*.ico')):
        if path.name == 'code.ico':
            continue
        with Image.open(path) as original:
            canvas = original.ico.getimage((256, 256)).convert('RGBA')
        ImageDraw.Draw(canvas).rectangle((148, 183, 216, 251), fill='#f5f6f7')
        canvas.alpha_composite(SOURCE.resize((64, 64), Image.Resampling.LANCZOS), (150, 185))
        canvas.save(path, sizes=SIZES)
    big = [(164, 314, 126), (192, 386, 147), (246, 459, 190),
           (273, 556, 211), (328, 604, 255), (355, 700, 273), (410, 797, 317)]
    small = [(55, 55, 44), (64, 68, 52), (83, 80, 63),
             (92, 97, 76), (110, 106, 86), (119, 123, 96), (138, 140, 116)]
    for kind, dimensions in (('big', big), ('small', small)):
        for dpi, (width, height, logo_size) in zip(range(100, 251, 25), dimensions):
            stamp((width, height), logo_size).convert('RGB').save(WIN / f'inno-{kind}-{dpi}.bmp')
    msi = ROOT / 'build/windows/msi/resources/stable'
    stamp((493, 58), 50, (438, 6)).convert('RGB').save(msi / 'wix-banner.bmp')
    stamp((493, 312), 120, (22, 152)).convert('RGB').save(msi / 'wix-dialog.bmp')
    copyfile(ROOT / 'icons/branding/logo.svg', ROOT / 'src/stable/src/vs/workbench/browser/media/code-icon.svg')
    for name in ('codium_cnl.svg', 'codium_clt.svg', 'codium_cnl_w80_b8.svg'):
        copyfile(ROOT / 'icons/branding/logo.svg', ROOT / 'icons/stable' / name)
    print('Updated stable Windows app, file-type, tile, setup and workbench icons.')


if __name__ == '__main__':
    main()
