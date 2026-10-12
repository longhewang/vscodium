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

## 6GPRT Windows ZIP build

Pushes to `dev` trigger `.github/workflows/dev-windows.yml`. It builds Windows x64
and uploads `6GPRT-windows-x64-zip`, containing only the portable
`6GPRT-win32-x64-<version>.zip`. MSI, EXE setup packages, checksum sidecars and
standalone CLI archives are excluded. The application's CLI is compiled and
included in the portable application. ZIP uses maximum Deflate compression;
the GitHub artifact wrapper uses no additional compression.

The stable application's display name and executable are `6GPRT` and
`6GPRT.exe`. Its command-line entry is `bin/6gprt.cmd`, with the tunnel binary
`bin/6gprt-tunnel.exe`. Digits are valid at the start of Windows file names.
The URI protocol is `gprt` because URI schemes must start with a letter.
The policy/registry product identifier is `GPRT`; Windows application IDs and
installer GUIDs are distinct from VSCodium. Stable user data and extensions use
6GPRT-specific locations, including `%APPDATA%/6GPRT` and `%USERPROFILE%/.6gprt`.

This dev ZIP build disables the upstream VSCodium update feed. It is distributed
through this fork's GitHub build artifacts. `dev/build.sh -p` likewise creates a
Windows portable ZIP by default. Existing MSI source and tooling remain available
for other workflows, and Insiders branding is unchanged.
