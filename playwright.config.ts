import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests",
	fullyParallel: true,
	reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
	use: {
		baseURL: process.env.BASE_URL ?? "http://localhost:4321",
	},
});
