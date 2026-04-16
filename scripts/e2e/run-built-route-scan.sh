#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

E2E_PREVIEW_PORT="${E2E_PREVIEW_PORT:-4173}"
E2E_BASE_URL="${E2E_BASE_URL:-http://127.0.0.1:${E2E_PREVIEW_PORT}}"
PREVIEW_LOG=".dev/preview-route-scan.log"
export E2E_PREVIEW_PORT
export E2E_BASE_URL

mkdir -p .dev

cleanup() {
	if [[ -n "${PREVIEW_PID:-}" ]] && kill -0 "${PREVIEW_PID}" >/dev/null 2>&1; then
		kill "${PREVIEW_PID}" >/dev/null 2>&1 || true
		wait "${PREVIEW_PID}" >/dev/null 2>&1 || true
	fi
}
trap cleanup EXIT

pnpm exec vite preview --host 127.0.0.1 --port "${E2E_PREVIEW_PORT}" >"${PREVIEW_LOG}" 2>&1 &
PREVIEW_PID=$!

node <<'NODE'
const baseUrl = process.env.E2E_BASE_URL;
const deadline = Date.now() + 30_000;

(async () => {
	while (Date.now() < deadline) {
		try {
			const response = await fetch(baseUrl, { redirect: 'manual' });
			if (response.status > 0) process.exit(0);
		} catch {}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	console.error(`[built-route-scan] Preview server did not become ready at ${baseUrl}`);
	process.exit(1);
})();
NODE

E2E_BASE_URL="${E2E_BASE_URL}" pnpm exec vitest run --maxWorkers=1 __tests__/e2e/build-route-scan.test.ts
