import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
	use: {
		baseURL: process.env.BASE_URL ?? "http://localhost:4321",
		// Tagged as a bot so GoatCounter's automatic bot filtering excludes CI smoke-test
		// pageviews from the real visitor count.
		userAgent: "Mozilla/5.0 (compatible; AkosMakraCVSmokeTestBot/1.0; +https://akosmakra.github.io)",
	},
	// Cross-browser coverage catches engine-specific rendering bugs (e.g. Chrome vs Firefox
	// disagreeing on the static position of an absolutely-positioned flex child) that a
	// single-browser suite would miss entirely.
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		{ name: "firefox", use: { ...devices["Desktop Firefox"] } },
		{ name: "webkit", use: { ...devices["Desktop Safari"] } },
	],
});
