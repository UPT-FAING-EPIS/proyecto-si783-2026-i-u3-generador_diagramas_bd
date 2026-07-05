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

Write-Host "== FluxSQL workspace check =="
Write-Host "Repo: $root"

$commands = @("node", "pnpm", "python", "docker")
foreach ($command in $commands) {
  $resolved = Get-Command $command -ErrorAction SilentlyContinue
  if ($resolved) {
    Write-Host "[ok] $command -> $($resolved.Source)"
  } else {
    Write-Host "[missing] $command"
  }
}

Write-Host "`nWorkspace files:"
$paths = @(
  "apps/web/frontend-app/package.json",
  "apps/desktop/frontend-app/package.json",
  "apps/desktop/backend-python/main.py",
  "apps/vscode-extension/package.json",
  "docker-compose.test-dbs.yml",
  "scripts/fluxsql-mcp-stdio.mjs"
)
foreach ($path in $paths) {
  if (Test-Path $path) { Write-Host "[ok] $path" } else { Write-Host "[missing] $path" }
}

Write-Host "`nPorts:"
foreach ($port in @(3000, 3002, 8000, 15432, 13306)) {
  $listeners = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Where-Object { $_.State -eq "Listen" }
  if ($listeners) {
    Write-Host "[busy] $port"
  } else {
    Write-Host "[free] $port"
  }
}

Write-Host "`nDocker test DB status:"
docker compose -f docker-compose.test-dbs.yml ps 2>$null
