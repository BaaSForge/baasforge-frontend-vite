import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const templatePath = path.join(rootDir, "dist/index.html");
const serverEntryPath = path.join(rootDir, "dist/server/entry-server.js");

async function prerenderHome() {
    const { renderHomePage } = await import(serverEntryPath);
    const template = fs.readFileSync(templatePath, "utf-8");
    const html = renderHomePage("/");

    const rendered = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

    fs.writeFileSync(templatePath, rendered);
    console.log("Prerendered home page into dist/index.html");
}

prerenderHome().catch((error) => {
    console.error(error);
    process.exit(1);
});
