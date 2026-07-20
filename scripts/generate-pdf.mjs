import { chromium } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";

const DIST_DIR = path.resolve(import.meta.dirname, "..", "dist");

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

function serveDist() {
	return new Promise((resolve) => {
		const server = createServer(async (req, res) => {
			let filePath = path.join(DIST_DIR, decodeURIComponent(req.url.split("?")[0]));
			if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
				filePath = path.join(DIST_DIR, "index.html");
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

const server = await serveDist();
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

console.log("Generated dist/cv.pdf from the live page.");
