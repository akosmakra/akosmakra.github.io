const ALLOWED_ORIGIN = "https://akosmakra.github.io";
const REPO = "akosmakra/akosmakra.github.io";
const WORKFLOW_FILE = "live-smoke-tests.yml";
const LOCK_KEY = "active-run";
// Deliberate cooldown between triggers: once someone starts a run, no new run can be
// started for this long, regardless of how quickly the underlying pipeline finishes.
const LOCK_TTL_SECONDS = 300;

function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": ALLOWED_ORIGIN,
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};
}

function jsonResponse(body, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { ...corsHeaders(), "Content-Type": "application/json" },
	});
}

async function githubApi(path, env, init = {}) {
	return fetch(`https://api.github.com${path}`, {
		...init,
		headers: {
			Authorization: `Bearer ${env.GITHUB_TOKEN}`,
			Accept: "application/vnd.github+json",
			"User-Agent": "cv-smoke-test-trigger-worker",
			...(init.headers ?? {}),
		},
	});
}

async function handleTrigger(env) {
	const existing = await env.SMOKE_LOCK.get(LOCK_KEY, { type: "json" });
	if (existing && typeof existing.startedAt === "number") {
		return jsonResponse({ ok: false, alreadyRunning: true, startedAt: existing.startedAt, expiresAt: existing.startedAt + LOCK_TTL_SECONDS * 1000 });
	}

	const startedAt = Date.now();
	const res = await githubApi(`/repos/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`, env, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ ref: "master" }),
	});

	if (!res.ok) {
		const detail = await res.text();
		return jsonResponse({ error: "dispatch_failed", status: res.status, detail }, 502);
	}

	await env.SMOKE_LOCK.put(LOCK_KEY, JSON.stringify({ startedAt }), { expirationTtl: LOCK_TTL_SECONDS });

	return jsonResponse({ ok: true, startedAt, expiresAt: startedAt + LOCK_TTL_SECONDS * 1000 });
}

async function handleRuns(env) {
	const res = await githubApi(`/repos/${REPO}/actions/workflows/${WORKFLOW_FILE}/runs?event=workflow_dispatch&per_page=5`, env);
	const body = await res.text();
	return new Response(body, { status: res.status, headers: { ...corsHeaders(), "Content-Type": "application/json" } });
}

async function handleJobs(runId, env) {
	const res = await githubApi(`/repos/${REPO}/actions/runs/${runId}/jobs`, env);
	const body = await res.text();
	return new Response(body, { status: res.status, headers: { ...corsHeaders(), "Content-Type": "application/json" } });
}

export default {
	async fetch(request, env) {
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders() });
		}

		const url = new URL(request.url);

		if (request.method === "POST" && url.pathname === "/trigger") {
			return handleTrigger(env);
		}

		if (request.method === "GET" && url.pathname === "/runs") {
			return handleRuns(env);
		}

		if (request.method === "GET" && url.pathname === "/jobs") {
			const runId = url.searchParams.get("run_id");
			if (!runId) return jsonResponse({ error: "missing run_id" }, 400);
			return handleJobs(runId, env);
		}

		return new Response("Not found", { status: 404, headers: corsHeaders() });
	},
};
