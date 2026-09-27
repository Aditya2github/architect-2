// Exports docs/hero/architecture.html to docs/architecture.png and docs/architecture.pdf.
const path = require("path");
const puppeteer = require("puppeteer-core");

(async () => {
  const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 2400, height: 1560, deviceScaleFactor: 1 });
  await page.goto("file:///" + path.join(__dirname, "architecture.html").replace(/\\/g, "/"), { waitUntil: "networkidle0" });
  await page.waitForFunction(() => window.READY === true);
  const docs = path.join(__dirname, "..");
  await page.screenshot({ path: path.join(docs, "architecture.png"), type: "png" });
  await page.pdf({ path: path.join(docs, "architecture.pdf"), width: "2400px", height: "1560px", printBackground: true, pageRanges: "1" });
  await browser.close();
  console.log("exported architecture.png and architecture.pdf");
})();
