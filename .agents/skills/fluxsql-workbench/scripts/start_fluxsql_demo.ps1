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

Write-Host "Starting FluxSQL Docker test databases..."
pnpm run dev:test-dbs

Write-Host "Starting local sidecar on http://127.0.0.1:8000 ..."
$sidecarDir = Join-Path $root "apps/desktop/backend-python"
Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$sidecarDir`"; `$env:FLUXSQL_WEB_URL='https://fluxsql-bd-frontend-app.vercel.app'; python main.py --port 8000"
) -WindowStyle Normal

Write-Host "Starting Desktop frontend production server on http://127.0.0.1:3002 ..."
Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$root`"; pnpm --filter @fluxsql/desktop exec next start -p 3002"
) -WindowStyle Normal

Write-Host "Open http://127.0.0.1:3002 after both terminals are ready."
