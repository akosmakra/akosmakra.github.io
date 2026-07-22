const ALLOWED_ORIGIN = "https://akosmakra.github.io";
const REPO = "akosmakra/akosmakra.github.io";
const WORKFLOW_FILE = "live-smoke-tests.yml";

function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": ALLOWED_ORIGIN,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};
}

export default {
	async fetch(request, env) {
		if (request.method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders() });
		}

		if (request.method !== "POST") {
			return new Response("Method not allowed", { status: 405, headers: corsHeaders() });
		}

		const response = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.GITHUB_TOKEN}`,
				Accept: "application/vnd.github+json",
				"User-Agent": "cv-smoke-test-trigger-worker",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ref: "master" }),
		});

		if (!response.ok) {
			const detail = await response.text();
			return new Response(JSON.stringify({ error: "dispatch_failed", status: response.status, detail }), {
				status: 502,
				headers: { ...corsHeaders(), "Content-Type": "application/json" },
			});
		}

		return new Response(JSON.stringify({ ok: true, triggeredAt: Date.now() }), {
			headers: { ...corsHeaders(), "Content-Type": "application/json" },
		});
	},
};
