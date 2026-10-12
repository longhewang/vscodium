# RT menu contributions

The fork applies `patches/80-rt-menubar.patch` during its normal VS Code build.
It adds RT after Terminal and before Help. Chinese UI shows `射线追踪`; other
languages show `RT`. The built-in command opens the command palette filtered to
RT. Extensions should use `category: "RT"` for discoverability.

The fork exposes two contribution points:

- `menuBar/rt`: commands and submenus inside the RT menu.
- `menuBar/main`: submenus as new top-level menus. Direct commands are rejected.

Declare commands in `contributes.commands` and implement them with
`vscode.commands.registerCommand`. Declare custom submenus in `contributes.submenus`.
`group`, `when`, and command `enablement` work through the standard contribution
handler. Inside RT, group names separate sections and `@number` orders items.
For `menuBar/main`, group prefixes are ignored and the `@number` suffix positions
the submenu in the built-in row: Terminal is 7, RT is 7.5, Help is 8.

Extension submenu IDs, rather than translated labels, identify top-level menus.
Different extensions can use identical labels without overwriting each other.
Removing or disabling an extension removes its registrations. Empty extension
menus do not block native Windows menu updates. Both custom and native menu styles
are supported; this contribution point is specific to this fork.

## Example extension

`dev/rt-menu-example` demonstrates both contribution points. It displays a test
notification; it does not implement a ray tracing engine. Launch the built app
with an absolute `--extensionDevelopmentPath` pointing to that directory, then
verify the RT command and the RT Tools top-level menu. Disable the example or
restart without the flag to verify removal. Compare Chinese/English UI and
custom/native menu styles (using the `window.menuStyle` setting).

The focused checks run locally or in CI against patched source:

```powershell
node dev/test_rt_menu_patch.cjs <patched-vscode-directory>
```

## Windows MSI build

Pushes to `dev` trigger `.github/workflows/dev-windows.yml`. It builds Windows x64
and uploads `windows-x64-msi`, containing one unsigned Chinese MSI and checksums.
The portable ZIP, EXE installers, and standalone CLI archive are excluded from
this artifact; the application's CLI is still compiled and included.

The MSI embeds its cabinet with high compression. The workflow uses WiX v3 from
the Windows runner. `MSI_CULTURE=zh-cn` and `MSI_SKIP_TRANSLATIONS=yes` build a
single-culture installer without requiring SDK 10.0.17763.0's translation scripts.
Other workflows retain the existing English-base multilingual MSI behavior.
GitHub artifact downloads remain ZIP containers; extract the `.msi` from that ZIP.
The installer format changes download packaging, not the application's installed size.
