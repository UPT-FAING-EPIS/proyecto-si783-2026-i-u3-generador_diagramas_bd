# Releases And Packages

FluxSQL uses GitHub releases and package workflows as evaluation evidence.

## Desktop

Workflow:

```txt
.github/workflows/desktop-release.yml
```

Tag pattern:

```txt
desktop-v*
```

Artifact:

```txt
FluxSQL_*_x64-setup.exe
```

## VS Code Extension

Workflow:

```txt
.github/workflows/vscode-marketplace.yml
```

Tag pattern:

```txt
vscode-v*
```

Artifacts:

```txt
*.vsix
vscode-extension-checksums.txt
```

Marketplace publishing requires `VSCE_PAT`.

## npm Codex Skill

Workflow:

```txt
.github/workflows/npm-skill-publish.yml
```

Tag pattern:

```txt
skill-v*
```

Package:

```txt
fluxsql-codex-skill
```

Publishing uses npm trusted publishing or `NPM_TOKEN`.

## Complete Product Bundle

Workflow:

```txt
.github/workflows/product-release.yml
```

Tag pattern:

```txt
release-v*
```

Artifacts:

- Windows installer `.exe`
- VS Code extension `.vsix`
- npm skill `.tgz`
- SHA256 checksum files
