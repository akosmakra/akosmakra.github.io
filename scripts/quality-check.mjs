import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const SITE_URL = process.env.SITE_URL ?? "https://akosmakra.github.io";
const COMMIT_SHA = (process.env.GITHUB_SHA ?? "local").slice(0, 7);
const DATA_DIR = path.resolve(import.meta.dirname, "..", "src", "data");

function runTests() {
	try {
		execSync("pnpm exec playwright test --project=chromium", {
			env: { ...process.env, BASE_URL: SITE_URL },
			stdio: "inherit",
		});
		return { passed: true };
	} catch {
		return { passed: false };
	}
}

function readTestCount() {
	try {
		const results = JSON.parse(readFileSync(path.resolve(import.meta.dirname, "..", "test-results", "results.json"), "utf-8"));
		return results.stats?.expected ?? 0;
	} catch {
		return 0;
	}
}

async function runLighthouse() {
	const browser = await chromium.launch({ args: ["--remote-debugging-port=9222"] });
	try {
		const { lhr } = await lighthouse(SITE_URL, {
			port: 9222,
			output: "json",
			onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
			logLevel: "error",
		});
		return {
			performance: Math.round(lhr.categories.performance.score * 100),
			accessibility: Math.round(lhr.categories.accessibility.score * 100),
			bestPractices: Math.round(lhr.categories["best-practices"].score * 100),
			seo: Math.round(lhr.categories.seo.score * 100),
		};
	} finally {
		await browser.close();
	}
}

const testResult = runTests();
const testCount = readTestCount();
const lighthouseScores = await runLighthouse();

mkdirSync(DATA_DIR, { recursive: true });
writeFileSync(
	path.join(DATA_DIR, "status.json"),
	JSON.stringify(
		{
			builtAt: new Date().toISOString(),
			commit: COMMIT_SHA,
			testsPassed: testResult.passed,
			testCount,
			lighthouse: lighthouseScores,
		},
		null,
		2,
	),
);

console.log("Wrote src/data/status.json");
if (!testResult.passed) process.exit(1);
