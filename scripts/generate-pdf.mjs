import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile, rm } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const DIST_DIR = path.join(ROOT_DIR, "dist");
const PDF_DIST_DIR = path.join(ROOT_DIR, "dist-pdf");

const CONTENT_TYPES = {
	".html": "text/html",
	".js": "text/javascript",
	".css": "text/css",
	".svg": "image/svg+xml",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".png": "image/png",
	".json": "application/json",
	".woff2": "font/woff2",
};

function serveDir(dir) {
	return new Promise((resolve) => {
		const server = createServer(async (req, res) => {
			let filePath = path.join(dir, decodeURIComponent(req.url.split("?")[0]));
			if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
				filePath = path.join(dir, "index.html");
			}

			try {
				const data = await readFile(filePath);
				const ext = path.extname(filePath);
				res.writeHead(200, { "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream" });
				res.end(data);
			} catch {
				res.writeHead(404);
				res.end("Not found");
			}
		});
		server.listen(0, "127.0.0.1", () => resolve(server));
	});
}

// Build a separate copy of the site with contact details included (see
// Sidebar.astro's PDF_BUILD check) — the regular dist/ never contains them,
// so the deployed HTML stays free of scrapable email/phone info.
console.log("Building a contact-details-included copy of the site for the PDF...");
execSync("pnpm exec astro build --outDir dist-pdf", {
	cwd: ROOT_DIR,
	env: { ...process.env, PDF_BUILD: "true" },
	stdio: "inherit",
});

const server = await serveDir(PDF_DIST_DIR);
const { port } = server.address();

const browser = await chromium.launch();
const page = await browser.newPage();
await page.emulateMedia({ media: "print" });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
await page.pdf({
	path: path.join(DIST_DIR, "cv.pdf"),
	format: "A4",
	printBackground: true,
	margin: { top: "0", bottom: "0", left: "0", right: "0" },
});

await browser.close();
server.close();
await rm(PDF_DIST_DIR, { recursive: true, force: true });

console.log("Generated dist/cv.pdf (with contact details) from a separate PDF-only build.");
