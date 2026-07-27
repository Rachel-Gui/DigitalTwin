#!/bin/zsh
set -e

cd "${0:A:h}"

RUNTIME_ROOT="/Users/paul/.cache/codex-runtimes/codex-primary-runtime/dependencies"
if ! command -v node >/dev/null 2>&1 && [[ -x "$RUNTIME_ROOT/node/bin/node" ]]; then
  export PATH="$RUNTIME_ROOT/node/bin:$RUNTIME_ROOT/bin/fallback:$RUNTIME_ROOT/bin/override:$PATH"
fi

if ! command -v node >/dev/null 2>&1 || ! command -v pnpm >/dev/null 2>&1; then
  echo "Node.js 22+ and pnpm are required."
  echo "Install them, then run this file again."
  read -k 1 "?Press any key to close..."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  pnpm install
fi

echo "Preparing PHI WebXR..."
pnpm run build

echo "Opening http://localhost:3000"
(sleep 2; open "http://localhost:3000") &
pnpm run start -- --hostname 127.0.0.1 --port 3000
