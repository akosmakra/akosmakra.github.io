import { test, expect } from "@playwright/test";

test("page loads with the correct name and title", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/Ákos Makra/);
	await expect(page.getByRole("heading", { level: 1 })).toContainText("Ákos Makra");
});

test("sidebar shows a photo and a LinkedIn link", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator("aside img")).toBeVisible();
	await expect(page.getByRole("link", { name: /LinkedIn/i })).toBeVisible();
});

test("experience and education sections are present", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { name: "Experience" })).toBeVisible();
	await expect(page.getByRole("heading", { name: "Education" })).toBeVisible();
});

test("dark mode toggle switches the theme", async ({ page }) => {
	await page.goto("/");
	await page.getByRole("button", { name: "Change color theme" }).click();
	await page.getByRole("option", { name: "Dark", exact: true }).click();
	await expect(page.locator("html")).toHaveClass(/dark/);
});

test("download CV link points to a PDF", async ({ page }) => {
	await page.goto("/");
	const link = page.getByRole("link", { name: /Download CV/i });
	await expect(link).toHaveAttribute("href", /\.pdf$/);
});

test("external links open safely in a new tab", async ({ page }) => {
	await page.goto("/");
	const links = page.locator('main a[target="_blank"]');
	const count = await links.count();
	expect(count).toBeGreaterThan(0);
	for (let i = 0; i < count; i++) {
		await expect(links.nth(i)).toHaveAttribute("rel", /noopener/);
	}
});

test("no browser console errors on load", async ({ page }) => {
	const errors: string[] = [];
	page.on("console", (msg) => {
		if (msg.type() === "error") errors.push(msg.text());
	});
	await page.goto("/");
	await page.waitForLoadState("networkidle");
	expect(errors).toEqual([]);
});
