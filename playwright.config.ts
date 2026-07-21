import { defineConfig } from "@playwright/test";

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
});
