// Renders hero.html frame by frame (deterministic, driven by window.render(t)) into PNGs.
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer-core");

const FPS = 30;
const dir = __dirname;
const out = path.join(dir, "frames");
const only = process.argv[2] ? process.argv[2].split(",").map(Number) : null; // e.g. "0.8,2.5" for stills

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: "new",
    args: ["--hide-scrollbars", "--force-device-scale-factor=1"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto("file:///" + path.join(dir, "hero.html").replace(/\\/g, "/") + "#capture", { waitUntil: "networkidle0" });
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const times = only ?? Array.from({ length: Math.round(duration * FPS) + 1 }, (_, i) => i / FPS);
  for (let i = 0; i < times.length; i++) {
    await page.evaluate((t) => window.render(t), times[i]);
    const name = only ? `still-${times[i]}.png` : `f${String(i).padStart(4, "0")}.png`;
    await page.screenshot({ path: path.join(only ? dir : out, name), type: "png" });
  }
  await browser.close();
  console.log(`rendered ${times.length} frame(s)`);
})();
