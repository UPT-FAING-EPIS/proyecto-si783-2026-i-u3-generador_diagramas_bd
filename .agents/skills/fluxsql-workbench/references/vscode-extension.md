# FluxSQL VS Code Extension

## Location

```txt
apps/vscode-extension
```

## Build And Test

```powershell
pnpm run build:vscode-extension
pnpm --filter ./apps/vscode-extension test
pnpm run package:vscode-extension
```

Expected VSIX:

```txt
apps/vscode-extension/fluxsql-0.0.1.vsix
```

## Local Install

```powershell
code --install-extension apps/vscode-extension/fluxsql-0.0.1.vsix --force
```

Then run `Developer: Reload Window` in VS Code.

## Commands

- `FluxSQL: Open Diagram Editor`
- `FluxSQL: Generate Diagram from SQL File`
- `FluxSQL: Generate Diagram from Selection`
- `FluxSQL: Export Diagram as Mermaid`
- `FluxSQL: Export Diagram as SVG`
- `FluxSQL: Export Diagram as JSON`
- `FluxSQL: Export All Diagram Artifacts`

## Marketplace

Publisher in `package.json` should match the Visual Studio Marketplace publisher:

```json
"publisher": "JeffersonVargas"
```

Publish manually from Marketplace by uploading the VSIX, or use CLI after login:

```powershell
cd apps/vscode-extension
vsce login JeffersonVargas
vsce publish
```

Do not paste PAT tokens into chat logs.
