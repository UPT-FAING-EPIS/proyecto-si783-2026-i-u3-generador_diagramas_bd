$ErrorActionPreference = "Stop"

function Get-RepoRoot {
  $current = Resolve-Path "."
  while ($current) {
    $hasPackageJson = Test-Path (Join-Path $current "package.json") -PathType Leaf
    $hasWorkspace = Test-Path (Join-Path $current "pnpm-workspace.yaml") -PathType Leaf
    if ($hasPackageJson -and $hasWorkspace) {
      return $current.Path
    }
    $parent = Split-Path $current -Parent
    if ($parent -eq $current) { break }
    $current = Resolve-Path $parent
  }
  throw "FluxSQL repo root not found."
}

$root = Get-RepoRoot
Set-Location $root

Write-Host "Building FluxSQL VS Code extension..."
pnpm run build:vscode-extension

Write-Host "Running extension tests..."
pnpm --filter ./apps/vscode-extension test

Write-Host "Packaging VSIX..."
pnpm run package:vscode-extension

$vsix = Join-Path $root "apps/vscode-extension/fluxsql-0.0.1.vsix"
if (!(Test-Path $vsix)) {
  throw "VSIX was not created: $vsix"
}

Write-Host "VSIX ready: $vsix"
