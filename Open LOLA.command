#!/bin/zsh
cd "${0:A:h}"
if ! curl --silent --fail http://127.0.0.1:5173/ >/dev/null; then
  if [[ ! -d node_modules ]]; then
    npm install || exit 1
  fi
  npm run dev -- --port 5173 &
  for attempt in {1..30}; do
    curl --silent --fail http://127.0.0.1:5173/ >/dev/null && break
    sleep 1
  done
fi
open http://127.0.0.1:5173/
wait
