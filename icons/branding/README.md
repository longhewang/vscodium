# Nanjing Zizheng Zhixin branding

`logo.svg` contains the three original vector paths extracted from the supplied
Illustrator file's PDF-compatible data. Colors match the PNG reference:
`#859acf`, `#536eb3`, and `#1e489e`. The background is transparent; the square
canvas fits the mark edge-to-edge horizontally and centers it vertically without
stretching it.

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
Start menu tiles, Inno Setup bitmaps, WiX bitmaps, the workbench mark and all four theme variants of the empty-editor
watermark (`letterpress-*.svg`). Watermarks retain the original theme colors and
opacity while using the custom logo paths.
ICO files include 16, 20, 24, 32, 48, 64, 96, 128 and 256 pixel representations.
Generated resources are committed, so GitHub builds need no icon tooling.
Existing macOS, Linux and Insiders resources are outside this Windows change.

The `Dev - 6GPRT Windows ZIP` workflow builds `dev` on pushes or manual dispatch.
Download `6GPRT-windows-x64-zip` after it succeeds. It contains only the portable
`6GPRT-win32-x64-<version>.zip`; no MSI or EXE installers are generated. The stable
app is named `6GPRT`, using the same supplied company logo.
