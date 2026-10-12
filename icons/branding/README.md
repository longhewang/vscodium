# Nanjing Zizheng Zhixin branding

`logo.svg` contains the three original vector paths extracted from the supplied
Illustrator file's PDF-compatible data. Colors match the PNG reference:
`#859acf`, `#536eb3`, and `#1e489e`. The background is transparent; the square
canvas adds padding without stretching the mark.

`logo-1024.png` is the SVG raster export. Regenerate Windows resources with:

```powershell
python -m pip install Pillow
python icons/branding/generate_windows.py
```

After editing the SVG, export a transparent 1024 x 1024 PNG first. With Inkscape:

```powershell
inkscape icons/branding/logo.svg --export-width=1024 --export-height=1024 --export-filename=icons/branding/logo-1024.png
```

The generator updates stable Windows application and file-association icons,
Start menu tiles, Inno Setup bitmaps, WiX bitmaps and the workbench mark.
ICO files include 16, 20, 24, 32, 48, 64, 96, 128 and 256 pixel representations.
Generated resources are committed, so GitHub builds need no icon tooling.
Existing macOS, Linux and Insiders resources are outside this Windows change.

The `Dev - Windows installers` workflow builds `dev` on pushes or manual dispatch.
Download `windows-x64-installers` after it succeeds: it contains the ZIP and
unsigned user/system EXE installers. MSI packaging is disabled in this workflow;
its artwork is ready for a future MSI build.
