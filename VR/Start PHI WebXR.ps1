$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path "node_modules")) {
  pnpm.cmd install
}

pnpm.cmd run dev -- --hostname 127.0.0.1 --port 3000
