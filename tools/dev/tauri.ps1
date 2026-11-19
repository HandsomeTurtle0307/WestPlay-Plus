# Runs Tauri's CLI for this checkout: `tauri.ps1 dev`, `tauri.ps1 build`, or `tauri.ps1 installer`
# (the NSIS installer, from app/tauri.release.conf.json).
#
# The Tauri config lives in app/, not at the repository root, so the CLI has to run from there. The
# environment below is this machine's GNU toolchain setup:
#   CARGO_HOME  the workspace's own cargo cache (it lives on D:, the toolchain itself on C:)
#   RUSTFLAGS   link-self-contained, so rustc uses its bundled MinGW libraries (w64devkit's GCC 16
#               no longer ships libgcc_eh.a)
param(
  [ValidateSet('dev', 'build', 'installer')]
  [string]$Action = 'dev'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$app = Join-Path $root 'app'

$env:CARGO_HOME = Join-Path $root '.cargo-home'
$cargoBin = Join-Path $env:USERPROFILE '.cargo\bin'
if (Test-Path $cargoBin) { $env:Path = "$cargoBin;$env:Path" }
if (-not $env:RUSTFLAGS) { $env:RUSTFLAGS = '-Clink-self-contained=yes' }

Push-Location $app
try {
  switch ($Action) {
    'dev' { npx tauri dev }
    'build' { npx tauri build }
    'installer' { npx tauri build --config tauri.release.conf.json }
  }
  exit $LASTEXITCODE
} finally {
  Pop-Location
}
